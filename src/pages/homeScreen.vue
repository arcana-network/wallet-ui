<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

import AppLoader from '@/components/AppLoader.vue'
import AssetsView from '@/components/AssetsView.vue'
import UserWallet from '@/components/UserWallet.vue'
import { useRpcStore } from '@/store/rpc'
import { errors } from '@/utils/content'
import { getImage } from '@/utils/getImage'
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
    if (
      Number(rpcStore.walletBalanceChainId) !== Number(rpcStore.selectedChainId)
    ) {
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
    rpcStore.walletBalance = '0'
    await sleep(100)
    await rpcStore.getWalletBalance()
  } catch (err) {
    console.log(errors.WALLET.BALANCE)
  } finally {
    hideLoader()
  }
}

async function handleRefresh() {
  refreshIconAnimating.value = true
  try {
    await rpcStore.getWalletBalance()
  } catch (err) {
    console.log(errors.WALLET.BALANCE)
  } finally {
    refreshIconAnimating.value = false
  }
}

rpcStore.$subscribe(() => {
  if (
    Number(rpcStore.walletBalanceChainId) !== Number(rpcStore.selectedChainId)
  ) {
    handleChainChange()
  }
})
</script>

<template>
  <div v-if="loader.show" class="flex justify-center items-center flex-1">
    <AppLoader :message="loader.message" />
  </div>
  <div v-else class="flex flex-col justify-between">
    <UserWallet
      page="home"
      :refresh-icon-animating="refreshIconAnimating"
      @refresh="handleRefresh"
    />
    <div class="my-5">
      <AssetsView :refresh="refreshIconAnimating" />
    </div>
    <div class="flex space-x-1 justify-center items-center">
      <span class="text-sm">Powered by</span>
      <img :src="getImage('arcana-logo.svg')" alt="arcana" class="h-3" />
    </div>
  </div>
</template>
