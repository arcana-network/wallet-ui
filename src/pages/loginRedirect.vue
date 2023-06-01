<script setup lang="ts">
import { GetInfoOutput, SocialLoginType } from '@arcana/auth-core'
import { Core, SecurityQuestionModule } from '@arcana/key-helper'
import dayjs from 'dayjs'
import { getUniqueId } from 'json-rpc-engine'
import { connectToParent } from 'penpal'
import { onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

import type { RedirectParentConnectionApi } from '@/models/Connection'
import { GATEWAY_URL, AUTH_NETWORK } from '@/utils/constants'
import { getAuthProvider } from '@/utils/getAuthProvider'
import {
  getStateFromUrl,
  handlePasswordlessLogin,
  handlePasswordlessLoginV2,
  handleSocialLogin,
  verifyOpenerPage,
} from '@/utils/redirectUtils'
import { getStorage, initStorage } from '@/utils/storageWrapper'

const route = useRoute()
const { appId } = route.params
initStorage(String(appId))

let channel: BroadcastChannel | null = null

onMounted(init)
onUnmounted(cleanup)

const isV3 = (s: string) => {
  return s.length > 10
}

const getLoginTypeFromState = (s: string) => {
  return s.split('-')[0]
}
async function init() {
  const storage = getStorage()
  const parentAppUrl = storage.local.getItem('parentAppUrl')
  const loginSrc = storage.local.getItem('loginSrc')
  const isStandalone =
    loginSrc === 'rn' || loginSrc === 'flutter' || loginSrc === 'unity'
  // TODO: Fix this V, throw error n stuff
  if (!parentAppUrl) {
    return
  }
  try {
    const state = getStateFromUrl(route.fullPath)
    const connectionToParent =
      await connectToParent<RedirectParentConnectionApi>({}).promise
    if (
      !isStandalone &&
      getLoginTypeFromState(state) !== SocialLoginType.passwordless
    ) {
      await verifyOpenerPage(state)
    }
    const authProvider = await getAuthProvider(`${appId}`, !isV3(state))
    if (authProvider.isLoggedIn()) {
      const info = authProvider.getUserInfo()
      const userInfo: GetInfoOutput & { hasMfa?: boolean; pk?: string } = {
        userInfo: info.userInfo,
        loginType: info.loginType,
        privateKey: '',
      }
      storage.session.setItem(`info`, JSON.stringify(userInfo))
      const exp = dayjs().add(1, 'day')
      getStorage().local.setItem(
        'pk',
        JSON.stringify({ pk: info.privateKey, exp, id: userInfo.userInfo.id })
      )
      const core = new Core(
        info.privateKey,
        info.userInfo.id,
        String(appId),
        GATEWAY_URL,
        AUTH_NETWORK === 'dev'
      )
      await core.init()
      const key = await core.getKey()
      userInfo.privateKey = key
      userInfo.hasMfa =
        storage.local.getItem(`${userInfo.userInfo.id}-has-mfa`) === '1'
      userInfo.pk = info.privateKey
      if (!userInfo.hasMfa) {
        const securityQuestionModule = new SecurityQuestionModule(3)
        securityQuestionModule.init(core)
        const isEnabled = await securityQuestionModule.isEnabled()
        userInfo.hasMfa = isEnabled
      }
      storage.session.setItem(`userInfo`, JSON.stringify(userInfo))
      storage.session.setItem(`isLoggedIn`, JSON.stringify(true))
      const messageId = getUniqueId()
      if (info.loginType === SocialLoginType.passwordless) {
        await handlePasswordlessLoginV2(userInfo, connectionToParent).catch(
          async () => {
            channel = new BroadcastChannel(`${appId}_login_notification`)
            await handlePasswordlessLogin(
              userInfo,
              messageId,
              parentAppUrl,
              connectionToParent,
              channel
            )
          }
        )
      } else {
        if (isStandalone) {
          await connectionToParent.goToWallet()
          return
        }
        await handleSocialLogin(
          userInfo,
          messageId,
          parentAppUrl,
          connectionToParent
        )
      }
    } else {
      await reportError('Could not login, please try again', parentAppUrl)
      return
    }
  } catch (e) {
    console.log({ e })
    if (e instanceof Error) {
      // await reportError(e.message, parentAppUrl)
    }
  }
}

function cleanup() {
  if (channel) {
    channel.close()
  }
}
async function reportError(errorMessage: string, parentUrl: string) {
  const connectionToParent = await connectToParent<RedirectParentConnectionApi>(
    {}
  ).promise
  await connectionToParent.error(errorMessage, parentUrl)
  return
}
</script>

<template>
  <div>Please wait...</div>
</template>
