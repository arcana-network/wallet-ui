<script setup lang="ts">
import { connectToParent } from 'penpal'
import { onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

import type { RedirectParentConnectionApi } from '@/models/Connection'
import { getAuthProvider } from '@/utils/getAuthProvider'

const route = useRoute()
const { appId } = route.params

let channel: BroadcastChannel | null = null

onMounted(init)
onUnmounted(cleanup)

async function init() {
  try {
    channel = new BroadcastChannel('login_notification')
    const authProvider = await getAuthProvider(`${appId}`)
    if (authProvider.isLoggedIn()) {
      const info = authProvider.getUserInfo()
      channel.postMessage({ status: 'success', info })
      sessionStorage.setItem('userInfo', JSON.stringify(info))
      sessionStorage.setItem('isLoggedIn', JSON.stringify(true))
    } else {
      await reportError('Could not login, please try again')
      return
    }

    const parentAppUrl = localStorage.getItem('parentAppUrl')
    const connectionToParent =
      await connectToParent<RedirectParentConnectionApi>({}).promise
    connectionToParent.redirect(parentAppUrl)
  } catch (e) {
    if (e instanceof Error) {
      await reportError(e.message)
    }
  }
}

function cleanup() {
  if (channel) {
    channel.close()
  }
}
async function reportError(errorMessage) {
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
