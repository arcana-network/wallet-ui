<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'vue-toastification'

import { useRpcStore } from '@/store/rpc'
import { getRequestHandler } from '@/utils/requestHandlerSingleton'
import { useImage } from '@/utils/useImage'

const emit = defineEmits(['close'])
const props = defineProps<{
  chainId: number
}>()

const rpcStore = useRpcStore()
const toast = useToast()

const getImage = useImage()
const rpcConfigForEdit = rpcStore.getRpcConfig(Number(props.chainId))

const rpcConfig = ref({
  chainName: rpcConfigForEdit?.chainName,
  chainId: rpcConfigForEdit?.chainId,
  rpcUrl: rpcConfigForEdit?.rpcUrls[0],
  currencySymbol: rpcConfigForEdit?.nativeCurrency?.symbol,
  explorerUrl: rpcConfigForEdit?.blockExplorerUrls?.[0],
})

function isExistingRpcUrl(url: string) {
  const exisitingRpcUrls = rpcStore.rpcConfigList
    .filter((chain) => Number(chain.chainId) !== Number(props.chainId))
    .map((chain) => chain.rpcUrls)
    .flat()

  return exisitingRpcUrls.some((rpcUrl) => {
    return rpcUrl === url
  })
}

function isExistingChainId(chainId: number) {
  return rpcStore.rpcConfigList.some(
    (chain) =>
      Number(chain.chainId) === chainId &&
      Number(chain.chainId) !== Number(props.chainId)
  )
}

function handleSubmit() {
  const rpcUrl = rpcConfig.value.rpcUrl
  const chainId = rpcConfig.value.chainId
  if (isExistingRpcUrl(rpcUrl as string)) {
    toast.error(`RPC URL - ${rpcUrl} already exists, please use different one`)
  } else if (isExistingChainId(Number(rpcConfig.value.chainId))) {
    toast.error(
      `Chain ID - ${chainId} already exists, please use different one`
    )
  } else {
    const payload = {
      chainName: rpcConfig.value.chainName,
      chainId: rpcConfig.value.chainId as string,
      blockExplorerUrls: [rpcConfig.value.explorerUrl as string],
      rpcUrls: [rpcConfig.value.rpcUrl as string],
      favicon: rpcConfigForEdit?.favicon as string,
      isCustom: true,
      nativeCurrency: {
        symbol: rpcConfig.value.currencySymbol as string,
        decimals: 18,
      },
    }
    rpcStore.editNetwork(Number(props.chainId), payload)
    if (Number(props.chainId) === Number(rpcStore.selectedRPCConfig.chainId)) {
      rpcStore.setSelectedRPCConfig(payload)
    }
    if (Number(props.chainId) === Number(rpcStore.selectedRPCConfig.chainId)) {
      getRequestHandler().setRpcConfig({
        ...payload,
        chainId: Number(payload.chainId),
      })
    }
    emit('close')
  }
}

function deleteNetwork() {
  if (Number(rpcStore.selectedRpcConfig.chainId) === Number(props.chainId)) {
    toast.error(
      'This network is current selected, please chose a different one and try again'
    )
  } else {
    rpcStore.deleteNetwork(Number(props.chainId))
    emit('close')
  }
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex justify-between">
      <p class="text-xl sm:text-sm font-semibold">Edit Network</p>
      <button
        v-if="rpcConfigForEdit?.isCustom"
        class="h-auto"
        @click="deleteNetwork"
      >
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
