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
import { useStarterTipsStore } from '@/store/starterTips'
import { AUTH_NETWORK } from '@/utils/constants'
import { getImage } from '@/utils/getImage'
import { initializeOnRampMoney } from '@/utils/onrampmoney.ramp'
import { fetchTransakNetworks } from '@/utils/transak'

import '@/index.css'

const app = useAppStore()
const modal = useModalStore()
const requestStore = useRequestStore()
const parentConnectionStore = useParentConnectionStore()
const starterTipsStore = useStarterTipsStore()
const router = useRouter()
const { theme, expandWallet, showWallet, compactMode, sdkVersion } = toRefs(app)
const route = useRoute()

if (app.sdkVersion !== 'v3') {
  app.expandWallet = true
}

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

// onBeforeMount(async () => {
//   try {
//     await Promise.all([fetchTransakNetworks(), initializeOnRampMoney()])
//   } catch (e) {
//     console.error('Failed to initialize one or more on-ramps:', e)
//   }
// })

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
  if (newValue && sdkVersion.value === 'v3') app.expandWallet = false
  await setIframeStyle()
})

watch(expandWallet, setIframeStyle)

watch(compactMode, (val) => {
  if (val) starterTipsStore.setHideStarterTips()
  setIframeStyle()
})

watch(showRequestPage, (newValue) => {
  if (newValue) {
    starterTipsStore.setHideStarterTips()
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

const canShowCollapseButton = computed(
  () =>
    !(
      app.validAppMode === AppMode.Widget &&
      !app.compactMode &&
      requestStore.areRequestsPendingForApproval
    )
)

const showHeader = computed(() => {
  const routeName = route.name
  const routes = ['requests', 'PermissionRequest']
  return !routes.includes(routeName as string)
})
</script>

<template>
  <div class="flex flex-col h-full">
    <div
      v-show="expandWallet || app.expandRestoreScreen"
      class="flex flex-col h-full bg-white-300 dark:bg-black-300 overflow-hidden"
    >
      <div
        v-if="AUTH_NETWORK !== 'mainnet'"
        class="p-1 text-center"
        style="background: #ff682620"
      >
        <span class="text-xs" style="color: #ff6826"
          >This wallet is on Arcana
          <span class="capitalize">{{ AUTH_NETWORK }}</span> and is meant for
          testing only</span
        >
      </div>
      <div v-if="sdkVersion === 'v3'" class="flex justify-center mt-2 mb-2">
        <button
          v-if="canShowCollapseButton"
          class="flex flex-grow justify-center"
          @click="onClickOfHeader"
        >
          <img v-if="compactMode" :src="getImage('expand-arrow.svg')" />
          <img v-else :src="getImage('collapse-arrow.svg')" />
        </button>
      </div>
      <WalletHeader v-if="showHeader" />
      <div class="flex-grow wallet__container m-1 p-3">
        <RouterView class="flex-grow" />
        <img
          v-if="route.name === 'requests'"
          :src="getImage('secured-by-arcana.svg')"
          class="h-3 select-none mt-5"
        />
        <BaseModal v-if="modal.show" />
      </div>
      <WalletFooter v-if="showFooter && !starterTipsStore.show" />
    </div>
    <div
      v-if="sdkVersion === 'v3'"
      v-show="showWalletButton"
      class="relative h-[50vh] mt-[50vh] bg-white-300 rounded-t-sm dark:bg-black-300 transition-all duration-500 hover:h-[100vh] hover:mt-0"
      style="z-index: 999"
      :class="{
        'notification-animation': requestStore.areRequestsPendingForApproval,
      }"
    >
      <WalletButton class="relative z-1" />
    </div>
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
  max-height: 120px !important;
  padding: 1rem !important;
  font-family: Onest, sans-serif !important;
  text-overflow: ellipsis !important;
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
    height: 100vh;
    margin-top: 0;
  }

  100% {
    height: 50vh;
    margin-top: 50vh;
  }
}
</style>
