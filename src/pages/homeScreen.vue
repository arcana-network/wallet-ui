<script setup lang="ts">
import { ethers } from 'ethers'
import { ref, onMounted, onBeforeUnmount } from 'vue'

import AppLoader from '@/components/AppLoader.vue'
import AssetsView from '@/components/AssetsView.vue'
import UserWallet from '@/components/UserWallet.vue'
import { useRpcStore } from '@/store/rpc'
import { getRequestHandler } from '@/utils/requestHandlerSingleton'

const rpcStore = useRpcStore()
const walletBalance = ref('')
if (rpcStore.walletBalance) {
  walletBalance.value = ethers.utils.formatEther(rpcStore.walletBalance)
}
const loader = ref({
  show: false,
  message: '',
})
let balancePolling

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
      getWalletBalance()
    }
    balancePolling = setInterval(getWalletBalance, 4000)
  } catch (err) {
    console.log({ err })
  }
})

onBeforeUnmount(() => {
  if (balancePolling) {
    clearInterval(balancePolling)
  }
})

async function handleChainChange() {
  showLoader('Fetching Wallet Balance...')
  try {
    await getWalletBalance()
  } catch (err) {
    console.log({ err })
  } finally {
    hideLoader()
  }
}

async function getWalletBalance() {
  const accountHandler = getRequestHandler().getAccountHandler()
  if (accountHandler) {
    const balance = (await accountHandler.getBalance()) || '0'
    rpcStore.setWalletBalance(balance.toString())
    walletBalance.value = ethers.utils.formatEther(balance.toString())
  }
}

async function handleRefresh() {
  showLoader('Refreshing wallet balance...')
  try {
    await getWalletBalance()
  } catch (err) {
    console.log({ err })
  } finally {
    hideLoader()
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
      :wallet-balance="walletBalance"
      @refresh="handleRefresh"
    />
    <div class="pb-5 flex flex-col gap-1">
      <div class="font-semibold">Assets</div>
      <div class="wallet__card rounded-[10px] flex flex-1 flex-col">
        <AssetsView />
      </div>
    </div>
  </div>
</template>

<style scoped>
.section-title {
  font-size: var(--fs-400);
}
</style>
