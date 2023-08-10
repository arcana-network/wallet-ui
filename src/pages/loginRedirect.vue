<script setup lang="ts">
import {
  GetInfoOutput,
  SocialLoginType,
  StateInfo,
  decodeJSON,
} from '@arcana/auth-core'
import { Core, SecurityQuestionModule } from '@arcana/key-helper'
import axios from 'axios'
import dayjs from 'dayjs'
import { addHexPrefix } from 'ethereumjs-util'
import { ethers } from 'ethers'
import { getUniqueId } from 'json-rpc-engine'
import { connectToParent } from 'penpal'
import { v4 as genUUID } from 'uuid'
import { onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

import type { RedirectParentConnectionApi } from '@/models/Connection'
import { useAppStore } from '@/store/app'
import { AUTH_NETWORK, GATEWAY_URL, SESSION_EXPIRY_MS } from '@/utils/constants'
import { getAuthProvider } from '@/utils/getAuthProvider'
import {
  getStateFromUrl,
  handleLogin,
  verifyOpenerPage,
} from '@/utils/redirectUtils'
import { getStorage, initStorage } from '@/utils/storageWrapper'

const route = useRoute()
const { appId } = route.params
initStorage(String(appId))
const app = useAppStore()

let channel: BroadcastChannel | null = null

onMounted(init)
onUnmounted(cleanup)

async function init() {
  const storage = getStorage()
  const loginSrc = storage.local.getLoginSrc()
  const isStandalone =
    loginSrc === 'rn' || loginSrc === 'flutter' || loginSrc === 'unity'
  try {
    const state = getStateFromUrl(route.fullPath)
    storage.session.setState(state)
    const stateInfo = decodeJSON<StateInfo>(state)

    const connectionToParent =
      await connectToParent<RedirectParentConnectionApi>({}).promise

    if (!isStandalone && stateInfo.t !== SocialLoginType.passwordless) {
      await verifyOpenerPage(state)
    }

    const authProvider = await getAuthProvider(`${appId}`, false, false)
    const postLoginCleanup = await authProvider.checkRedirectMode()
    if (authProvider.isLoggedIn()) {
      const info = authProvider.getUserInfo()
      const userInfo: GetInfoOutput & { hasMfa?: boolean; pk?: string } = {
        userInfo: info.userInfo,
        loginType: info.loginType,
        token: '',
        privateKey: '',
      }
      storage.session.setUserInfo(userInfo)
      const exp = dayjs().add(1, 'day')
      getStorage().local.setPK({
        pk: info.privateKey,
        exp,
        id: userInfo.userInfo.id,
      })
      if (app.isMfaEnabled) {
        const core = new Core(
          info.privateKey,
          info.userInfo.id,
          String(appId),
          GATEWAY_URL,
          AUTH_NETWORK === 'dev'
        )
        await core.init()
        userInfo.privateKey = await core.getKey()
        userInfo.hasMfa = storage.local.getHasMFA(userInfo.userInfo.id)
        userInfo.pk = info.privateKey
        if (!userInfo.hasMfa) {
          const securityQuestionModule = new SecurityQuestionModule(3)
          securityQuestionModule.init(core)
          userInfo.hasMfa = await securityQuestionModule.isEnabled()
        }
      } else {
        userInfo.privateKey = info.privateKey
      }

      const uuid = genUUID()
      // {
      try {
        const loginToken = await getLoginToken({
          provider: info.loginType,
          token: info.token,
          signerAddress: ethers.utils.computeAddress(
            addHexPrefix(userInfo.privateKey)
          ),
          userID: userInfo.userInfo.id,
          appID: appId,
          privateKey: userInfo.privateKey,
        })

        userInfo.token = loginToken
        if (postLoginCleanup) {
          await postLoginCleanup()
        }
      } catch (e) {
        console.log('could not get token')
      }
      // }

      // For wallet usage purpose and standalone apps
      storage.session.setUserInfo(userInfo)
      storage.session.setIsLoggedIn()

      // For reconnect purpose
      storage.local.setUserInfo(userInfo)
      storage.local.setIsLoggedIn()
      storage.local.setSession({
        sessionID: uuid,
        timestamp: Date.now(),
      })

      const messageId = getUniqueId()
      await handleLogin({
        connection: connectionToParent,
        userInfo,
        state: stateInfo.i,
        sessionID: uuid,
        sessionExpiry: Date.now() + SESSION_EXPIRY_MS,
        messageId,
        isStandalone,
      })
      storage.local.clearLoginSrc()
      storage.session.clearState()
    } else {
      storage.local.clearLoginSrc()
      await reportError('Could not login, please try again')
      return
    }
  } catch (e) {
    console.log({ e })
    if (e instanceof Error) {
      await reportError(e.message)
    }
    await reportError(e as string)
  }
}

// eslint-disable-next-line no-undef
const OAUTH_URL = process.env.VUE_APP_OAUTH_SERVER_URL

async function getLoginToken({
  provider,
  token,
  signerAddress,
  userID,
  appID,
  privateKey,
}) {
  const wallet = new ethers.Wallet(privateKey)
  const nonce = await getNonce(wallet.address)
  const msg = [provider, token, nonce, signerAddress, userID, appID].join(':')
  const signature = await wallet.signMessage(msg)
  const url = new URL('/api/v2/loginToken', OAUTH_URL)

  const res = await axios.post<{ token: string }>(url.toString(), {
    provider,
    token,
    signature,
    signerAddress,
    userID,
    appID,
  })
  if (res.status !== 200) {
    throw new Error('Could not get login token')
  }
  return res.data.token
}

const getNonce = async (address: string) => {
  const url = new URL('/api/v2/loginNonce', OAUTH_URL)
  url.searchParams.append('address', address)
  const res = await axios.get<{ nonce: number }>(url.toString())
  return res.data.nonce
}

function cleanup() {
  if (channel) {
    channel.close()
  }
}
async function reportError(errorMessage: string) {
  const connectionToParent = await connectToParent<RedirectParentConnectionApi>(
    {}
  ).promise
  await connectionToParent.error(errorMessage)
  return
}
</script>

<template>
  <div>Please wait...</div>
</template>
