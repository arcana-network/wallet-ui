<script setup lang="ts">
import { AuthProvider } from '@arcana/auth'

AuthProvider.handleRedirectPage('*')
</script>

<template>
  <div>Please wait...</div>
</template>
