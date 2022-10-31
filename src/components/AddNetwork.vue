<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'vue-toastification'

import { useRpcStore } from '@/store/rpc'
import { useImage } from '@/utils/useImage'

const emit = defineEmits(['close'])

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

function isExistingRpcUrl(url) {
  const exisitingRpcUrls = rpcStore.rpcConfigList
    .map((chain) => chain.rpcUrls)
    .flat()

  return exisitingRpcUrls.some((rpcUrl) => {
    return rpcUrl === url
  })
}

function isExistingChainId(chainId) {
  return rpcStore.rpcConfigList.some((chain) => chain.chainId === chainId)
}

function handleSubmit() {
  const rpcUrl = rpcConfig.value.rpcUrl
  const chainId = rpcConfig.value.chainId
  if (isExistingRpcUrl(rpcUrl)) {
    toast.error(`RPC URL - ${rpcUrl} already exists, please use different one`)
  } else if (isExistingChainId(Number(chainId))) {
    toast.error(
      `Chain ID - ${chainId} already exists, please use different one`
    )
  } else {
    const payload = {
      chainName: rpcConfig.value.networkName,
      chainId: rpcConfig.value.chainId,
      blockExplorerUrls: [rpcConfig.value.explorerUrl],
      rpcUrls: [rpcConfig.value.rpcUrl],
      favicon: 'blockchain-icon',
      nativeCurrency: {
        symbol: rpcConfig.value.currencySymbol,
        decimals: 18,
      },
    }
    rpcStore.addNetwork(payload)
    rpcStore.setSelectedChainId(payload.chainId)
    emit('close')
  }
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex justify-between">
      <p class="text-xl sm:text-sm">Add a Network</p>
      <button class="h-auto" @click="emit('close')">
        <img :src="getImage('close-icon')" alt="close form" />
      </button>
    </div>
    <form class="space-y-3 sm:space-y-2" @submit.prevent="handleSubmit">
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
          placeholder="e.g. https://cloudflare-eth.com/"
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
          placeholder="e.g. 1"
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
          placeholder="e.g. https://etherscan.io/"
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
