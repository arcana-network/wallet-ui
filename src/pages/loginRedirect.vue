<script setup lang="ts">
import {
  GetInfoOutput,
  SocialLoginType,
  StateInfo,
  decodeJSON,
} from '@arcana/auth-core'
import { Core, SecurityQuestionModule } from '@arcana/key-helper'
import { captureException, captureMessage } from '@sentry/vue'
import dayjs from 'dayjs'
import { getUniqueId } from 'json-rpc-engine'
import { connectToParent } from 'penpal'
import { v4 as genUUID } from 'uuid'
import { onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

import type { RedirectParentConnectionApi } from '@/models/Connection'
import { useAppStore } from '@/store/app'
import { ChainType } from '@/utils/chainType'
import { AUTH_NETWORK, GATEWAY_URL, SESSION_EXPIRY_MS } from '@/utils/constants'
import { errors } from '@/utils/content'
import { devLogger } from '@/utils/devLogger'
import { getAuthProvider } from '@/utils/getAuthProvider'
import { getLoginToken } from '@/utils/loginToken'
import { getMnemonicInShard } from '@/utils/multiversx/shard'
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
    loginSrc === 'rn' ||
    loginSrc === 'flutter' ||
    loginSrc === 'unity' ||
    loginSrc === 'unity-ws'
  try {
    const state = getStateFromUrl(route.fullPath)
    storage.session.setState(state)
    const stateInfo = decodeJSON<StateInfo>(state)

    const connectionToParent =
      await connectToParent<RedirectParentConnectionApi>({}).promise

    if (!isStandalone && stateInfo.t !== SocialLoginType.passwordless) {
      await verifyOpenerPage(state)
    }

    const authProvider = await getAuthProvider(`${appId}`, false)
    devLogger.log('[loginRedirect] app curve', app.curve)
    storage.local.setCurve(app.curve)
    const postLoginCleanup = await authProvider.handleRedirect()
    if (authProvider.isLoggedIn()) {
      const info = authProvider.getUserInfo()
      devLogger.log('[loginRedirect] info', info)
      const userInfo: GetInfoOutput & { hasMfa?: boolean; pk?: string } = {
        userInfo: info.userInfo,
        loginType: info.loginType,
        token: '',
        privateKey: '',
      }
      storage.session.setUserInfo(info)
      const exp = dayjs().add(1, 'day')
      getStorage().local.setPK({
        pk: info.privateKey,
        exp,
        id: userInfo.userInfo.id,
      })
      devLogger.log('[loginRedirect] isMfaEnabled', app.isMfaEnabled)
      let mnemonic: undefined | string = undefined

      if (app.isMfaEnabled) {
        devLogger.log('[loginRedirect] before core', {
          dkgKey: info.privateKey,
          userId: info.userInfo.id,
          appId: String(appId),
          gatewayUrl: GATEWAY_URL,
          debug: AUTH_NETWORK === 'dev',
          curve: app.curve,
        })
        const core = new Core({
          dkgKey: info.privateKey,
          userId: info.userInfo.id,
          appId: String(appId),
          gatewayUrl: GATEWAY_URL,
          debug: AUTH_NETWORK === 'dev',
          curve: app.curve,
        })

        const isNewUser = await core.init()
        devLogger.log({ isNewUser })
        if (isNewUser && app.chainType === ChainType.multiversx_cv25519) {
          const shardID = parseInt(
            authProvider.appConfig.chain_settings?.shards
          )
          devLogger.log({
            shardFromAPI: shardID,
            config: authProvider.appConfig,
          })
          const mn = getMnemonicInShard(shardID)
          const key = mn.deriveKey().hex()
          await core.importKey(key)
          userInfo.privateKey = key
          mnemonic = mn.toString()
        } else {
          userInfo.privateKey = await core.getKey()
        }

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

      try {
        const loginToken = await getLoginToken({
          provider: info.loginType,
          token: info.token,
          userID: userInfo.userInfo.id,
          appID: appId,
          privateKey: userInfo.privateKey,
          curve: app.curve,
        })

        userInfo.token = loginToken
      } catch (e) {
        console.log(errors.LOGIN_TOKEN.FAILED, e)
      } finally {
        if (postLoginCleanup) {
          await postLoginCleanup()
        }
      }
      const uuid = genUUID()

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
        mnemonic,
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
    captureException(e)
    captureMessage(`Login failed on ${appId}`)
    if (e instanceof Error) {
      await reportError(e.message)
    }
    await reportError(e as string)
  }
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
