<script setup lang="ts">
import { getUniqueId } from 'json-rpc-engine'
import { connectToParent } from 'penpal'
import { onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

import type { RedirectParentConnectionApi } from '@/models/Connection'
import { getAuthProvider } from '@/utils/getAuthProvider'
import {
  handlePasswordlessLogin,
  handleSocialLogin,
} from '@/utils/redirectUtils'

const route = useRoute()
const { appId } = route.params

let channel: BroadcastChannel | null = null

onMounted(init)
onUnmounted(cleanup)

async function init() {
  const parentAppUrl = localStorage.getItem('parentAppUrl')
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
      sessionStorage.setItem('userInfo', JSON.stringify(info))
      sessionStorage.setItem('isLoggedIn', JSON.stringify(true))
      const messageId = getUniqueId()
      if (info.loginType === 'passwordless') {
        channel = new BroadcastChannel(`${appId}_login_notification`)
        await handlePasswordlessLogin(
          info,
          messageId,
          parentAppUrl,
          connectionToParent,
          channel
        )
      } else {
        await handleSocialLogin(
          info,
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
