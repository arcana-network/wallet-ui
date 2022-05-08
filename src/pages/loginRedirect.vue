<script setup lang="ts">
import { AuthProvider } from '@arcana/auth'
import { connectToParent } from 'penpal'
import { useRoute } from 'vue-router'

import type { ParentConnectionApi } from '@/models/Connection'

const route = useRoute()
const { appId } = route.params

const authProvider = await AuthProvider.init({
  appId: `${appId}`,
  redirectUri: `${window.location.origin}/${appId}/redirect`,
  network: 'dev',
  flow: 'redirect',
  debug: true,
})

if (authProvider.isLoggedIn()) {
  const info = authProvider.getUserInfo()
  sessionStorage.setItem('info', JSON.stringify(info))
  sessionStorage.setItem('isLoggedIn', JSON.stringify(true))
}
const parentAppUrl = localStorage.getItem('parentAppUrl')
const connection = connectToParent<ParentConnectionApi>({})
connection.promise.then((parent) => {
  parent.redirect(parentAppUrl)
})
</script>

<template>
  <div>Please wait...</div>
</template>
