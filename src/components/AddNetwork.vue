<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'vue-toastification'

import { useRpcStore } from '@/store/rpc'
import { useImage } from '@/utils/useImage'

const emits = defineEmits(['close'])

const rpcStore = useRpcStore()
const getImage = useImage()
const toast = useToast()

const rpcConfig = ref({
  networkName: '',
  rpcUrl: '',
  currencySymbol: '',
  chainId: '',
  explorerUrl: '',
})

function checkIfNameExist(chainName) {
  return rpcStore.chainList.some((chain) => chain.chainName === chainName)
}

function onSubmit() {
  const chainName = rpcConfig.value.networkName
  if (checkIfNameExist(chainName)) {
    toast.error(`${chainName} already exists, please use different one`)
  } else {
    const payload = {
      chainName: rpcConfig.value.networkName,
      chainId: Number(rpcConfig.value.chainId),
      blockExplorerUrls: [rpcConfig.value.explorerUrl],
      rpcUrls: [rpcConfig.value.rpcUrl],
      favicon: getImage('blockchain-icon'),
      nativeCurrency: {
        symbol: rpcConfig.value.currencySymbol,
        decimals: Math.pow(10, 18),
      },
    }
    rpcStore.addNetwork(payload)
    emits('close')
  }
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex justify-between">
      <p class="text-xl sm:text-sm">Add a Network</p>
      <button class="h-auto" @click="emits('close')">
        <img :src="getImage('close-icon')" alt="close form" />
      </button>
    </div>
    <form class="space-y-3 sm:space-y-2" @submit.prevent="onSubmit">
      <div class="space-y-1">
        <label class="text-xs text-zinc-400" for="networkName">
          Network Name
        </label>
        <input
          id="networkName"
          v-model="rpcConfig.networkName"
          required
          type="text"
          class="text-base sm:text-sm bg-gradient w-full p-2 sm:p-1 rounded-lg border-none outline-none"
          placeholder="e.g. Ethereum"
        />
      </div>
      <div class="space-y-1">
        <label class="text-xs text-zinc-400" for="rpcUrl"> RPC URL </label>
        <input
          id="rpcUrl"
          v-model="rpcConfig.rpcUrl"
          required
          type="text"
          class="text-base sm:text-sm bg-gradient w-full p-2 sm:p-1 rounded-lg border-none outline-none"
          placeholder="e.g. https://blockchain.dev.arcana.network"
        />
      </div>
      <div class="space-y-1">
        <label class="text-xs text-zinc-400" for="currencySymbol">
          Currency Symbol
        </label>
        <input
          id="currencySymbol"
          v-model="rpcConfig.currencySymbol"
          required
          type="text"
          class="text-base sm:text-sm bg-gradient w-full p-2 sm:p-1 rounded-lg border-none outline-none"
          placeholder="e.g. ETH"
        />
      </div>
      <div class="space-y-1">
        <label class="text-xs text-zinc-400" for="chainId"> Chain ID </label>
        <input
          id="chainId"
          v-model="rpcConfig.chainId"
          required
          type="text"
          class="text-base sm:text-sm bg-gradient w-full p-2 sm:p-1 rounded-lg border-none outline-none"
          placeholder="e.g. 40404"
        />
      </div>
      <div class="space-y-1">
        <label class="text-xs text-zinc-400" for="explorerUrl">
          Explorer URL (Optional)
        </label>
        <input
          id="explorerUrl"
          v-model="rpcConfig.explorerUrl"
          type="text"
          class="text-base sm:text-sm bg-gradient w-full p-2 sm:p-1 rounded-lg border-none outline-none"
          placeholder="e.g. https://explorer.dev.arcana.network/"
        />
      </div>
      <div class="flex justify-center">
        <button
          class="text-sm sm:text-xs rounded-xl text-white dark:bg-white bg-black dark:text-black w-36 h-9 sm:w-20 sm:h-8"
        >
          Save
        </button>
      </div>
    </form>
  </div>
</template>
