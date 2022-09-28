<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'vue-toastification'

import { useRpcStore } from '@/store/rpc'
import { useImage } from '@/utils/useImage'

const emit = defineEmits(['close'])

const rpcStore = useRpcStore()
const toast = useToast()

const getImage = useImage()
const editChainId = rpcStore.editChainId
const rpcConfigForEdit = rpcStore.rpcConfigForEdit

const rpcConfig = ref({
  chainName: rpcConfigForEdit?.chainName,
  chainId: rpcConfigForEdit?.chainId,
  rpcUrl: rpcConfigForEdit?.rpcUrls[0],
  currencySymbol: rpcConfigForEdit?.nativeCurrency?.symbol,
  explorerUrl: rpcConfigForEdit?.blockExplorerUrls,
})

function isExistingRpcUrl(url) {
  const exisitingRpcUrls = rpcStore.rpcConfigList
    .filter((chain) => chain.chainId !== editChainId)
    .map((chain) => chain.rpcUrls)
    .flat()

  return exisitingRpcUrls.some((rpcUrl) => {
    return rpcUrl === url
  })
}

function isExistingChainId(chainId) {
  return rpcStore.rpcConfigList.some(
    (chain) => chain.chainId === chainId && chain.chainId !== editChainId
  )
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
      chainName: rpcConfig.value.chainName,
      chainId: Number(rpcConfig.value.chainId),
      blockExplorerUrls: [rpcConfig.value.explorerUrl],
      rpcUrls: [rpcConfig.value.rpcUrl],
      favicon: rpcConfigForEdit?.favicon,
      nativeCurrency: {
        symbol: rpcConfig.value.currencySymbol,
        decimals: 18,
      },
    }
    rpcStore.editNetwork(editChainId, payload)
    emit('close')
  }
}

function deleteNetwork() {
  if (rpcStore.selectedChainId === editChainId) {
    toast.error(
      'This network is current selected, please chose a different one and try again'
    )
  } else {
    rpcStore.deleteNetwork(editChainId)
    emit('close')
  }
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex justify-between">
      <p class="text-xl sm:text-sm">Edit Network</p>
      <button class="h-auto" @click="deleteNetwork">
        <img :src="getImage('trash-icon')" alt="close form" />
      </button>
    </div>
    <form class="space-y-3 sm:space-y-2" @submit.prevent="handleSubmit">
      <div class="space-y-1">
        <label class="text-xs text-zinc-400" for="networkName">
          Network Name
        </label>
        <input
          id="networkName"
          v-model="rpcConfig.chainName"
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
      <div class="flex justify-between">
        <button
          class="text-sm sm:text-xs rounded-xl border-2 border-black dark:border-white bg-transparent text-black dark:text-white w-36 h-9 sm:w-20 sm:h-8"
          @click.prevent="emit('close')"
        >
          Cancel
        </button>
        <button
          class="text-sm sm:text-xs rounded-xl text-white dark:bg-white bg-black dark:text-black w-36 h-9 sm:w-20 sm:h-8"
        >
          Save
        </button>
      </div>
    </form>
  </div>
</template>
