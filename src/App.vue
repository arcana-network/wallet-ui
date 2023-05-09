<script setup lang="ts">
import { toRefs, ref, watch, computed, onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import WalletFooter from '@/components/AppFooter.vue'
import BaseModal from '@/components/BaseModal.vue'
import type { Theme } from '@/models/Theme'
import { useAppStore } from '@/store/app'
import { useModalStore } from '@/store/modal'
import { useRequestStore } from '@/store/request'
import { fetchTransakNetworks } from '@/utils/transak'

import '@/index.css'

const app = useAppStore()
const modal = useModalStore()
const requestStore = useRequestStore()
const router = useRouter()
const { theme } = toRefs(app)
const isLoading = ref(false)
const route = useRoute()

const url = new URL(window.location.href)
if (url.searchParams.get('theme')) {
  theme.value = url.searchParams.get('theme') as Theme
}

const showRequestPage = computed(() => {
  return requestStore.areRequestsPendingForApproval
})

onBeforeMount(async () => {
  await fetchTransakNetworks()
})

watch(showRequestPage, () => {
  if (showRequestPage.value) {
    modal.show = false
    router.push({ name: 'requests', params: { appId: app.id } })
  }
})

const showFooter = computed(() => {
  return (
    !['requests', 'MFARequired', 'MFARestore'].includes(route.name as string) ||
    (route.name === 'requests' && !requestStore.pendingRequest)
  )
})
</script>

<template>
  <div v-if="isLoading" class="flex col justify-center items-center h-full">
    <div>Loading...</div>
  </div>
  <div
    v-else
    class="flex flex-col h-full"
    :class="[theme === 'dark' ? 'dark-mode' : 'light-mode']"
  >
    <div class="flex-grow wallet__container">
      <RouterView class="min-h-full" />
      <BaseModal v-if="modal.show" />
    </div>
    <WalletFooter v-if="showFooter" />
  </div>
</template>

<style>
::-webkit-scrollbar {
  width: 0.75rem;
  height: 0.75rem;
}

::-webkit-scrollbar-thumb {
  background-color: var(--scrollbar-thumb-color);
  background-clip: padding-box;
  border: 0.25rem solid transparent;
  border-radius: 10px;
}

body {
  height: 100vh;
  font-family: SoraVariable, sans-serif;
}

#app {
  height: 100%;
  overflow-x: hidden;
}

.wallet__container {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding: var(--p-400);
  overflow-x: hidden;
  color: var(--fg-color);
  background: var(--container-bg-color);
}

.flow-container > *:not(:first-child) {
  margin-top: var(--flow-space-container);
}

.flow-element > *:not(:first-child) {
  margin-top: var(--flow-space-element);
}

.v-popper--theme-tooltip {
  background-color: #101010;
}

.v-popper__inner {
  width: 230px;
  height: 110px;
  font-size: var(--fs-300);
  font-weight: 400;
  color: #f9f9f9;
  background-color: #101010;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
