<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

import AppLoader from '@/components/AppLoader.vue'
import AssetsView from '@/components/AssetsView.vue'
import UserWallet from '@/components/UserWallet.vue'
import { useRpcStore } from '@/store/rpc'
import { sleep } from '@/utils/sleep'

const rpcStore = useRpcStore()
const refreshIconAnimating = ref(false)
const loader = ref({
  show: false,
  message: '',
})

function showLoader(message) {
  loader.value.show = true
  loader.value.message = `${message}...`
}

function hideLoader() {
  loader.value.show = false
  loader.value.message = ''
}

onMounted(() => {
  try {
    if (rpcStore.walletBalanceChainId !== rpcStore.selectedChainId) {
      handleChainChange()
    } else {
      rpcStore.getWalletBalance()
    }
    rpcStore.setUpBalancePolling()
  } catch (err) {
    console.log({ err })
  }
})

onBeforeUnmount(rpcStore.cleanUpBalancePolling)

async function handleChainChange() {
  showLoader('Fetching Wallet Balance...')
  try {
    await sleep(100)
    await rpcStore.getWalletBalance()
  } catch (err) {
    console.log({ err })
  } finally {
    hideLoader()
  }
}

async function handleRefresh() {
  refreshIconAnimating.value = true
  try {
    await rpcStore.getWalletBalance()
  } catch (err) {
    console.log({ err })
  } finally {
    refreshIconAnimating.value = false
  }
}

rpcStore.$subscribe(() => {
  if (rpcStore.walletBalanceChainId !== rpcStore.selectedChainId) {
    handleChainChange()
  }
})
</script>

<template>
  <div v-if="loader.show" class="flex justify-center items-center flex-1">
    <AppLoader :message="loader.message" />
  </div>
  <div v-else>
    <UserWallet
      page="home"
      :refresh-icon-animating="refreshIconAnimating"
      @refresh="handleRefresh"
    />
    <div class="my-6">
      <AssetsView :refresh="refreshIconAnimating" />
    </div>
  </div>
</template>
