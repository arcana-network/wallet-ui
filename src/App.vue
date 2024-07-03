<script setup lang="ts">
import { AppMode } from '@arcana/auth'
import { computed, toRefs, watch, defineAsyncComponent, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BaseModal from '@/components/BaseModal.vue'
import type { Theme } from '@/models/Theme'
import { useActivitiesStore } from '@/store/activities'
import { useAppStore } from '@/store/app'
import { useModalStore } from '@/store/modal'
import { useParentConnectionStore } from '@/store/parentConnection'
import { useRequestStore } from '@/store/request'
import { useStarterTipsStore } from '@/store/starterTips'
import { AUTH_NETWORK } from '@/utils/constants'
import { getImage } from '@/utils/getImage'
import {
  TransakStatus,
  subscribeTransakOrderId,
  unsubscribeTransakOrderId,
} from '@/utils/transak'

import '@/index.css'

const WalletFooter = defineAsyncComponent(
  () => import('@/components/AppFooter.vue')
)
const WalletButton = defineAsyncComponent(
  () => import('@/components/WalletButton.vue')
)
const WalletHeader = defineAsyncComponent(
  () => import('@/components/WalletHeader.vue')
)

const app = useAppStore()
const modal = useModalStore()
const requestStore = useRequestStore()
const parentConnectionStore = useParentConnectionStore()
const starterTipsStore = useStarterTipsStore()
const router = useRouter()
const { theme, expandWallet, showWallet, compactMode, sdkVersion } = toRefs(app)
const route = useRoute()
const activitiesStore = useActivitiesStore()

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

watch(requestStore.pendingRequests, async () => {
  await setIframeStyle()
})

const showFooter = computed(() => {
  return (
    (![
      'requests',
      'MFARequired',
      'MFARestore',
      'SendTokens',
      'SendNfts',
      'TransakSell',
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
  const routes = [
    'requests',
    'PermissionRequest',
    'TransakSell',
    'MFASetup',
    'MFARestore',
  ]
  return !routes.includes(routeName as string)
})

onMounted(() => {
  window.addEventListener('message', (ev) => {
    const response = ev.data.response
    if (ev.data.type === 'sell_token_init') {
      const existingActivities = activitiesStore.activities(response.chainId)
      const existingActivity = existingActivities?.find((activity) => {
        return (
          activity.operation === 'Sell' &&
          activity.sellDetails?.orderId === response.orderId
        )
      })
      if (!existingActivity) {
        activitiesStore.saveActivity(response.chainId, {
          txHash: response.txHash,
          status: TransakStatus[response.status],
          transaction: response.transaction || undefined,
          operation: 'Sell',
          date: new Date(),
          address: {
            from: response.partnerCustomerId,
            to: response.walletAddress,
          },
          customToken:
            response.contractAddress !== 'NATIVE'
              ? {
                  operation: 'Sell',
                  amount: response.cryptoAmount,
                  symbol: response.cryptoCurrency,
                  decimals: response.tokenDecimals,
                }
              : undefined,
          sellDetails: {
            orderId: response.orderId,
            provider: response.provider,
            crypto: {
              amount: response.cryptoAmount,
              currency: response.cryptoCurrency,
              contractAddress: response.contractAddress,
              decimals: response.tokenDecimals,
              logo: response.tokenLogo,
            },
            fiat: {
              amount: response.fiatAmount,
              currency: response.fiatCurrency,
              fee: response.totalFeeInFiat,
            },
          },
        })
        subscribeTransakOrderId(response.orderId, response.chainId)
      }
    } else if (
      [
        'sell_token_reject',
        'sell_token_tx_success',
        'sell_token_tx_failure',
      ].includes(ev.data.type)
    ) {
      const activityIndex = activitiesStore
        .activities(Number(response.chainId))
        .findIndex((activity) => {
          return (
            activity.operation === 'Sell' &&
            activity.sellDetails?.orderId === response.orderId
          )
        })
      if (activityIndex !== -1) {
        let status = ''
        if (ev.data.type === 'sell_token_reject') {
          status = 'Rejected'
          unsubscribeTransakOrderId(response.orderId)
        } else if (ev.data.type === 'sell_token_tx_success') {
          status = 'Approved'
          activitiesStore.activitiesByChainId[Number(response.chainId)][
            activityIndex
          ].txHash = response.txHash
        } else if (ev.data.type === 'sell_token_tx_failure') {
          status = 'Failed'
        }
        activitiesStore.activitiesByChainId[Number(response.chainId)][
          activityIndex
        ].status = status
      }
    }
  })
})
</script>

<template>
  <div class="flex flex-col h-full">
    <div
      v-show="expandWallet || app.expandRestoreScreen"
      class="flex flex-col h-full bg-white-200 dark:bg-black-eerie overflow-hidden"
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
        <!-- <Suspense> -->
        <RouterView class="flex-grow" />
        <!-- </Suspense> -->
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
        'notification-animation':
          requestStore.areRequestsPendingForApproval ||
          requestStore.skippedRequestsPendingForApprovalLength > 0,
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
  font-family: Inter, sans-serif !important;
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

.Vue-Toastification__toast--success {
  background-color: #24cc2b !important;
}

.Vue-Toastification__toast--error {
  background-color: #f61d1d !important;
}

@media (prefers-color-scheme: dark) {
  .Vue-Toastification__toast--success {
    background-color: #24ad29 !important;
  }

  .Vue-Toastification__toast--error {
    background-color: #e73232 !important;
  }
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
