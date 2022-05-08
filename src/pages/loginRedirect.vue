<script setup lang="ts">
import { connectToParent } from 'penpal'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

import type { ParentConnectionApi } from '@/models/Connection'
import { getAuthProvider } from '@/utils/getAuthProvider'

const route = useRoute()
const { appId } = route.params

onMounted(init)

async function init() {
  const authProvider = await getAuthProvider(`${appId}`)

  if (authProvider.isLoggedIn()) {
    const info = authProvider.getUserInfo()
    sessionStorage.setItem('userinfo', JSON.stringify(info))
    sessionStorage.setItem('isLoggedIn', JSON.stringify(true))
  }

  const parentAppUrl = localStorage.getItem('parentAppUrl')
  const connectionToParent = await connectToParent<ParentConnectionApi>({})
    .promise
  connectionToParent.redirect(parentAppUrl)
}
</script>

<template>
  <div>Please wait...</div>
</template>
