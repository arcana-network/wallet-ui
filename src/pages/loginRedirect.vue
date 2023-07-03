<script setup lang="ts">
import {
  GetInfoOutput,
  SocialLoginType,
  StateInfo,
  decodeJSON,
} from '@arcana/auth-core'
import { Core, SecurityQuestionModule } from '@arcana/key-helper'
import dayjs from 'dayjs'
import { getUniqueId } from 'json-rpc-engine'
import { connectToParent } from 'penpal'
import { v4 as genUUID } from 'uuid'
import { onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

import type { RedirectParentConnectionApi } from '@/models/Connection'
import { AUTH_NETWORK, GATEWAY_URL } from '@/utils/constants'
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

let channel: BroadcastChannel | null = null

const EXPIRY_MS = 60 * 60 * 1000

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

    const authProvider = await getAuthProvider(`${appId}`)
    if (authProvider.isLoggedIn()) {
      const info = authProvider.getUserInfo()
      const userInfo: GetInfoOutput & { hasMfa?: boolean; pk?: string } = {
        userInfo: info.userInfo,
        loginType: info.loginType,
        privateKey: '',
      }
      storage.session.setUserInfo(userInfo)
      const exp = dayjs().add(1, 'day')
      getStorage().local.setPK({
        pk: info.privateKey,
        exp,
        id: userInfo.userInfo.id,
      })
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
        state: stateInfo.i,
        sessionID: uuid,
        messageId,
        sessionExpiry: Date.now() + EXPIRY_MS,
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
