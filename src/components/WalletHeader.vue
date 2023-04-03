<script setup lang="ts">
import { useAppStore } from '@/store/app'
import { useImage } from '@/utils/useImage'

const appStore = useAppStore()
const getImage = useImage()

function shrinkWallet() {
  appStore.expandWallet = false
}
</script>

<template>
  <header class="flex justify-between rounded-t-xl">
    <div class="flex space-x-1 items-center">
      <img :src="appStore.appLogo.horizontal" alt="app logo" />
      <p>{{ appStore.name }}</p>
    </div>
    <button class="h-auto" @click="shrinkWallet">
      <img :src="getImage('arrow-icon')" alt="arrow" />
    </button>
  </header>
</template>

<style scoped>
header {
  padding: var(--p-300);
  color: var(--fg-color);
  background: var(--container-bg-color);
}
</style>
