<script setup lang="ts">
import { Theme } from '@arcana/auth'
import { useHeadSafe } from 'unhead'
import { useRoute } from 'vue-router'

const route = useRoute()
const theme = route.query.theme as Theme
document.documentElement.classList.add(theme)
useHeadSafe({
  title: 'Setup Multifactor Authentication | Arcana Wallet',
})
</script>

<template>
  <div>MFA Setup</div>
</template>
