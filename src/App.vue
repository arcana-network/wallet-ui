<script setup lang="ts">
import { toRefs, watch, computed, onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import WalletFooter from '@/components/AppFooter.vue'
import BaseModal from '@/components/BaseModal.vue'
import WalletButton from '@/components/WalletButton.vue'
import WalletHeader from '@/components/WalletHeader.vue'
import type { Theme } from '@/models/Theme'
import { useAppStore } from '@/store/app'
import { useModalStore } from '@/store/modal'
import { useParentConnectionStore } from '@/store/parentConnection'
import { useRequestStore } from '@/store/request'
import { getImage } from '@/utils/getImage'
import { isMobileViewport } from '@/utils/isMobileViewport'
import { initializeOnRampMoney } from '@/utils/onrampmoney.ramp'
import { fetchTransakNetworks } from '@/utils/transak'

import '@/index.css'

const app = useAppStore()
const modal = useModalStore()
const requestStore = useRequestStore()
const parentConnectionStore = useParentConnectionStore()
const router = useRouter()
const { theme, expandWallet, showWallet, compactMode, sdkVersion } = toRefs(app)
const route = useRoute()

const url = new URL(window.location.href)
if (url.searchParams.get('theme')) {
  theme.value = url.searchParams.get('theme') as Theme
}

const showRequestPage = computed(() => {
  return requestStore.areRequestsPendingForApproval
})

onBeforeMount(async () => {
  try {
    await Promise.all([fetchTransakNetworks(), initializeOnRampMoney()])
  } catch (e) {
    console.error('Failed to initialize one or more on-ramps:', e)
  }
})

async function setIframeStyle() {
  const parentConnectionInstance = await parentConnectionStore.parentConnection
    ?.promise
  await parentConnectionInstance?.setIframeStyle(app.iframeStyle())
}

watch(showWallet, async (newValue) => {
  if (newValue) app.expandWallet = false
  setIframeStyle()
})

watch(expandWallet, setIframeStyle)

watch(compactMode, setIframeStyle)

watch(showRequestPage, (newValue) => {
  if (newValue) {
    modal.show = false
    router.push({ name: 'requests', params: { appId: app.id } })
  }
})

const showFooter = computed(() => {
  return (
    (!['requests', 'MFARequired', 'MFARestore'].includes(
      route.name as string
    ) ||
      (route.name === 'requests' && !requestStore.pendingRequest)) &&
    !app.compactMode
  )
})

function onClickOfHeader() {
  if (app.compactMode) app.compactMode = false
  else app.expandWallet = false
}
</script>

<template>
  <div v-if="sdkVersion === 'v3'" class="flex flex-col h-full">
    <div
      v-show="expandWallet"
      class="flex flex-col h-full dark:bg-black-300 rounded-t-md overflow-hidden"
      :class="{ 'rounded-md': !isMobileViewport() }"
    >
      <div class="flex justify-center mt-2 mb-2">
        <button class="flex flex-grow justify-center" @click="onClickOfHeader">
          <img src="@/assets/images/collapse-arrow.svg" />
        </button>
      </div>
      <WalletHeader />
      <div
        class="flex-grow wallet__container m-1 p-3"
        :class="{ 'p-0': compactMode }"
      >
        <RouterView class="min-h-fullxs flex-grow" />
        <BaseModal v-if="modal.show" />
        <img :src="getImage('secured-by-arcana.svg')" class="h-xs mb-2" />
      </div>
      <WalletFooter v-if="showFooter" />
    </div>
    <div v-show="!expandWallet" class="h-full dark:bg-black-300 rounded-t-sm">
      <WalletButton />
    </div>
  </div>
  <div v-else class="flex flex-col h-full dark:bg-black-300">
    <div
      class="flex-grow wallet__container p-4"
      :class="{ 'rounded-b-xl p-0': compactMode }"
    >
      <RouterView class="min-h-full" />
      <BaseModal v-if="modal.show" />
    </div>
    <WalletFooter v-if="showFooter" />
  </div>
</template>

<style>
*::-webkit-scrollbar {
  width: 0.15rem;
  height: 0.15rem;
}

*::-webkit-scrollbar-thumb {
  background-color: #36363600;
  border-radius: 10px;
  transition: all 0.3s ease-in-out;
}

:hover::-webkit-scrollbar-thumb {
  background-color: #363636ff;
}

body {
  height: 100vh;
}

#app {
  height: 100%;
  overflow-x: hidden;
}

.wallet__container {
  display: flex;
  flex-direction: column;
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
