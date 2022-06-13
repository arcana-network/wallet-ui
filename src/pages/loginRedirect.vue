<script setup lang="ts">
import { connectToParent } from 'penpal'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

import type { RedirectParentConnectionApi } from '@/models/Connection'
import { getAuthProvider } from '@/utils/getAuthProvider'

const route = useRoute()
const { appId } = route.params

onMounted(init)

async function init() {
  try {
    const authProvider = await getAuthProvider(`${appId}`)
    if (authProvider.isLoggedIn()) {
      const info = authProvider.getUserInfo()
      sessionStorage.setItem('userInfo', JSON.stringify(info))
      sessionStorage.setItem('isLoggedIn', JSON.stringify(true))
    } else {
      reportError('Could not login, please try again')
      return
    }

    const parentAppUrl = localStorage.getItem('parentAppUrl')
    const connectionToParent =
      await connectToParent<RedirectParentConnectionApi>({}).promise
    connectionToParent.redirect(parentAppUrl)
  } catch (e) {
    await reportError(e.message)
  }
}

async function reportError(errorMessage) {
  const connectionToParent = await connectToParent<RedirectParentConnectionApi>(
    {}
  ).promise
  connectionToParent.error(errorMessage)
}
</script>

<template>
  <div>Please wait...</div>
</template>
