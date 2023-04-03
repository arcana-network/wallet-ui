<script setup lang="ts">
import { GetInfoOutput } from '@arcana/auth-core'
import { Core } from '@arcana/key-helper'
import dayjs from 'dayjs'
import { getUniqueId } from 'json-rpc-engine'
import { connectToParent } from 'penpal'
import { onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

import type { RedirectParentConnectionApi } from '@/models/Connection'
import { GATEWAY_URL } from '@/utils/constants'
import { getAuthProvider } from '@/utils/getAuthProvider'
import {
  handlePasswordlessLogin,
  handlePasswordlessLoginV2,
  handleSocialLogin,
} from '@/utils/redirectUtils'
import { getStorage, initStorage } from '@/utils/storageWrapper'

const route = useRoute()
const { appId } = route.params
initStorage(String(appId))

let channel: BroadcastChannel | null = null

onMounted(init)
onUnmounted(cleanup)

async function init() {
  const storage = getStorage()
  const parentAppUrl = storage.local.getItem('parentAppUrl')
  const loginSrc = storage.local.getItem('loginSrc')
  // TODO: Fix this V, throw error n stuff
  if (!parentAppUrl) {
    return
  }
  try {
    const connectionToParent =
      await connectToParent<RedirectParentConnectionApi>({}).promise
    const authProvider = await getAuthProvider(`${appId}`)
    if (authProvider.isLoggedIn()) {
      const info = authProvider.getUserInfo()
      const userInfo: GetInfoOutput = {
        userInfo: info.userInfo,
        loginType: info.loginType,
        privateKey: '',
      }
      storage.session.setItem(`info`, JSON.stringify(userInfo))
      const exp = dayjs().add(1, 'day')
      getStorage().local.setItem(
        'pk',
        JSON.stringify({ pk: info.privateKey, exp })
      )
      const core = new Core(
        info.privateKey,
        info.userInfo.id,
        String(appId),
        GATEWAY_URL
      )
      await core.init()
      const key = await core.getKey()
      userInfo.privateKey = key
      storage.session.setItem(`userInfo`, JSON.stringify(userInfo))
      storage.session.setItem(`isLoggedIn`, JSON.stringify(true))
      const messageId = getUniqueId()
      if (info.loginType === 'passwordless') {
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
        if (loginSrc === 'rn' || loginSrc === 'flutter') {
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
    if (e instanceof Error) {
      await reportError(e.message, parentAppUrl)
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
