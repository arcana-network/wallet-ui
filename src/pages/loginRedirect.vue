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
import { onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

import type { RedirectParentConnectionApi } from '@/models/Connection'
import { useAppStore } from '@/store/app'
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
const app = useAppStore()

let channel: BroadcastChannel | null = null

onMounted(init)
onUnmounted(cleanup)

async function init() {
  const storage = getStorage()
  const loginSrc = storage.local.getItem('loginSrc')
  const isStandalone =
    loginSrc === 'rn' || loginSrc === 'flutter' || loginSrc === 'unity'
  try {
    const state = getStateFromUrl(route.fullPath)
    storage.session.setItem('state', state)
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
      storage.session.setItem('info', JSON.stringify(userInfo))
      const exp = dayjs().add(1, 'day')
      getStorage().local.setItem(
        'pk',
        JSON.stringify({ pk: info.privateKey, exp, id: userInfo.userInfo.id })
      )

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
        userInfo.hasMfa =
          storage.local.getItem(`${userInfo.userInfo.id}-has-mfa`) === '1'
        userInfo.pk = info.privateKey
        if (!userInfo.hasMfa) {
          const securityQuestionModule = new SecurityQuestionModule(3)
          securityQuestionModule.init(core)
          userInfo.hasMfa = await securityQuestionModule.isEnabled()
        }
      } else {
        userInfo.privateKey = info.privateKey
      }

      storage.session.setItem(`userInfo`, JSON.stringify(userInfo))
      storage.session.setItem(`isLoggedIn`, JSON.stringify(true))
      const messageId = getUniqueId()
      await handleLogin({
        connection: connectionToParent,
        userInfo,
        state: stateInfo.i,
        messageId,
        isStandalone,
      })
      storage.local.removeItem('loginSrc')
      storage.session.removeItem('state')
    } else {
      storage.local.removeItem('loginSrc')
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
