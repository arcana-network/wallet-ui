<script setup lang="ts">
import { AppMode } from '@arcana/auth'
import { computed, onBeforeMount, toRefs, watch } from 'vue'
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

const showWalletButton = computed(() => {
  return !app.expandWallet && app.validAppMode !== AppMode.Widget
})

onBeforeMount(async () => {
  try {
    await Promise.all([fetchTransakNetworks(), initializeOnRampMoney()])
  } catch (e) {
    console.error('Failed to initialize one or more on-ramps:', e)
  }
})

async function setIframeStyle() {
  if (app.validAppMode === AppMode.NoUI) {
    return
  }
  const parentConnectionInstance = await parentConnectionStore.parentConnection
    ?.promise
  if (parentConnectionInstance && parentConnectionInstance['setIframeStyle']) {
    await parentConnectionInstance?.setIframeStyle(app.iframeStyle())
  }
}

watch(showWallet, async (newValue) => {
  if (newValue) app.expandWallet = false
  await setIframeStyle()
})

watch(expandWallet, setIframeStyle)

watch(compactMode, setIframeStyle)

watch(showRequestPage, (newValue) => {
  if (newValue) {
    modal.show = false
    router.push({ name: 'requests', params: { appId: app.id } })
  }
})

watch(requestStore.pendingRequests, () => {
  setIframeStyle()
})

const showFooter = computed(() => {
  return (
    (![
      'requests',
      'MFARequired',
      'MFARestore',
      'SendTokens',
      'SendNfts',
    ].includes(route.name as string) ||
      (route.name === 'requests' && !requestStore.pendingRequest)) &&
    !app.compactMode
  )
})

async function onClickOfHeader() {
  const c = await parentConnectionStore.parentConnection?.promise
  if (app.compactMode) {
    app.compactMode = false
  } else {
    app.standaloneMode == 1 || app.standaloneMode == 2
      ? c?.uiEvent('wallet_close', null)
      : (app.expandWallet = false)
  }
}

function canShowCollapseButton() {
  if (
    app.validAppMode === AppMode.Widget &&
    !app.compactMode &&
    requestStore.areRequestsPendingForApproval
  ) {
    return false
  }
  return true
}
</script>

<template>
  <div v-if="sdkVersion === 'v3'" class="flex flex-col h-full">
    <div
      v-show="expandWallet"
      class="flex flex-col h-full bg-white-300 dark:bg-black-300 overflow-hidden"
    >
      <div class="flex justify-center mt-2 mb-2">
        <button
          v-if="canShowCollapseButton()"
          class="flex flex-grow justify-center"
          @click="onClickOfHeader"
        >
          <img v-if="compactMode" :src="getImage('expand-arrow.svg')" />
          <img v-else :src="getImage('collapse-arrow.svg')" />
        </button>
      </div>
      <WalletHeader v-if="route.name !== 'requests'" />
      <div class="flex-grow wallet__container m-1 p-3">
        <RouterView class="flex-grow" />
        <img
          v-if="route.name === 'requests'"
          :src="getImage('secured-by-arcana.svg')"
          class="h-3 select-none mt-5"
        />
        <BaseModal v-if="modal.show" />
      </div>
      <WalletFooter v-if="showFooter" />
    </div>
    <div
      v-show="showWalletButton"
      class="relative h-[50vh] mt-[50vh] bg-white-300 rounded-t-sm dark:bg-black-300"
      style="z-index: 999"
      :class="{
        'notification-animation': requestStore.areRequestsPendingForApproval,
      }"
    >
      <WalletButton class="relative z-1" />
      <span
        v-if="requestStore.areRequestsPendingForApproval"
        class="absolute -top-[15vh] right-[20vh] flex h-3 w-3"
      >
        <span
          class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75 duration-[4s]"
        ></span>
        <span
          class="relative inline-flex rounded-full h-3 w-3 bg-red-600"
        ></span>
      </span>
    </div>
  </div>
  <div v-else class="flex flex-col h-full bg-white-300 dark:bg-black-300">
    <div
      class="flex-grow wallet__container p-4"
      :class="{ 'p-0': compactMode }"
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

.Vue-Toastification__toast {
  min-height: unset !important;
  padding: 1rem !important;
  font-family: Onest, sans-serif !important;
}

.Vue-Toastification__icon {
  width: 14px !important;
  margin-right: 8px !important;
}

.Vue-Toastification__toast-body {
  font-size: 14px !important;
  line-height: 1.5 !important;
}

.Vue-Toastification__progress-bar {
  height: 2px !important;
}

.notification-animation {
  animation: notification 2s infinite;
}

@keyframes notification {
  0% {
    height: 50vh;
    margin-top: 50vh;
  }

  20% {
    height: 85vh;
    margin-top: 15vh;
  }

  30% {
    height: 50vh;
    margin-top: 50vh;
  }

  40% {
    height: 85vh;
    margin-top: 15vh;
  }

  100% {
    height: 50vh;
    margin-top: 50vh;
  }
}
</style>
