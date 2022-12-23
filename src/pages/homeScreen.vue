<script setup lang="ts">
import { ethers } from 'ethers'
import { onMounted, ref, watch } from 'vue'

import AssetsView from '@/components/AssetsView.vue'
import UserWallet from '@/components/UserWallet.vue'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import { getRequestHandler } from '@/utils/requestHandlerSingleton'

const userStore = useUserStore()
const rpcStore = useRpcStore()
const walletBalance = ref('')
const loader = ref({
  show: false,
  message: '',
})
const assets: {
  name?: string
  symbol: string
  decimals: number
  balance: string
}[] = []

function showLoader(message) {
  loader.value.show = true
  loader.value.message = `${message}...`
}

function hideLoader() {
  loader.value.show = false
  loader.value.message = ''
}

onMounted(() => {
  getWalletBalance()
})

rpcStore.$subscribe(getWalletBalance)

async function getWalletBalance() {
  showLoader('Fetching Wallet Balance')
  try {
    const accountHandler = getRequestHandler().getAccountHandler()
    if (accountHandler) {
      const balance = (await accountHandler.getBalance()) || '0'
      rpcStore.setWalletBalance(balance.toString())
      walletBalance.value = ethers.utils.formatEther(balance.toString())
      assets.push({ ...rpcStore.nativeCurrency, balance: balance.toString() })
    }
  } catch (err) {
    console.log({ err })
  } finally {
    hideLoader()
  }
}
</script>

<template>
  <div v-if="loader.show" class="flex justify-center items-center flex-1">
    <p class="sm:text-xs">{{ loader.message }}</p>
  </div>
  <div v-else>
    <UserWallet
      page="home"
      :wallet-balance="walletBalance"
      @refresh="getWalletBalance"
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
