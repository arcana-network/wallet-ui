<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Ref } from 'vue'

import GasPrice from '@/components/GasPrice.vue'
import { getGasPrice } from '@/services/gasPrice.service'
import { useRpcStore } from '@/store/rpc'

const rpcStore = useRpcStore()

const gasPrices: Ref<object> = ref({})

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

onMounted(async () => {
  showLoader('Loading')
  try {
    const data = await getGasPrice()
    gasPrices.value = data
  } catch (err) {
    console.log({ err })
    gasPrices.value = {}
  } finally {
    hideLoader()
  }
})

function handleSetGasPrice(value) {
  console.log(value)
}
</script>

<template>
  <div class="p-4 sm:p-2 h-full space-y-4 sm:space-y-3">
    <div class="flex flex-col space-y-2">
      <div class="flex justify-between">
        <p class="text-xl sm:text-sm">Send Transaction</p>
      </div>
      <p class="text-xs text-zinc-400">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor
      </p>
    </div>
    <div class="space-y-1">
      <p class="text-xs text-zinc-400">Network</p>
      <p class="text-base sm:text-sm">{{ rpcStore.rpcConfig?.chainName }}</p>
    </div>
    <div class="space-y-1">
      <label class="text-xs text-zinc-400" for="recipientWalletAddress">
        Origin
      </label>
      <p
        class="text-base sm:text-sm text-zinc-400 rounded-lg p-3 sm:p-1 bg-gradient"
      >
        0x.....AAVE
      </p>
    </div>
    <GasPrice :gas-prices="gasPrices" @gas-price-input="handleSetGasPrice" />
    <div class="space-y-1">
      <p class="text-base sm:text-sm rounded-lg p-3 sm:p-1 bg-gradient"></p>
    </div>
    <div class="flex space-x-3">
      <button
        class="text-sm sm:text-xs rounded-xl border-2 border-solid border-black dark:border-white flex-1"
      >
        Reject
      </button>
      <button
        class="text-sm sm:text-xs rounded-xl text-white dark:bg-white bg-black dark:text-black flex-1"
      >
        Approve
      </button>
    </div>
  </div>
</template>
