<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'vue-toastification'

import { useRpcStore } from '@/store/rpc'
import { content, errors } from '@/utils/content'
import { produceProviderFromURLString } from '@/utils/evm/rpcURLToProvider'
import { getImage } from '@/utils/getImage'

const emit = defineEmits(['close'])

const rpcStore = useRpcStore()
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

function isExistingChain(chainId) {
  return rpcStore.rpcConfigList.find(
    (chain) => Number(chain.chainId) === Number(chainId)
  )
}

async function handleSubmit() {
  try {
    const rpcUrl = rpcConfig.value.rpcUrl
    const chainId = rpcConfig.value.chainId
    const existingChain = isExistingChain(chainId)
    if (isExistingRpcUrl(rpcUrl)) {
      return toast.error(content.RPC.INPUT_EXISTS(rpcUrl))
    } else {
      const provider = produceProviderFromURLString(rpcConfig.value.rpcUrl)
      const chainId = await provider.getNetwork()
      await provider.destroy()
      if (Number(chainId.chainId) !== Number(rpcConfig.value.chainId)) {
        return toast(errors.RPC.ERROR)
      }
      if (existingChain) {
        rpcStore.setRpcConfig({
          ...existingChain,
          rpcUrls: [rpcConfig.value.rpcUrl],
        })
        rpcStore.setSelectedChainId(existingChain.chainId)
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
          isCustom: true,
        }
        rpcStore.addNetwork(payload)
        rpcStore.setRpcConfig({
          ...payload,
        })
        rpcStore.setSelectedChainId(payload.chainId)
      }
      emit('close')
    }
  } catch (e) {
    toast.error(errors.RPC.INVALID)
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="relative flex justify-center items-center">
      <button
        class="absolute left-0"
        title="Click to go back"
        @click.stop="emit('close')"
      >
        <img :src="getImage('back-arrow.svg')" class="w-6 h-6" />
      </button>
      <span class="text-lg font-bold">Add Network</span>
    </div>
    <form class="flex flex-col gap-2" @submit.prevent="handleSubmit">
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium" for="recipientWalletAddress">
          Network Name
        </label>
        <input
          id="networkName"
          v-model="rpcConfig.networkName"
          required
          type="text"
          class="input-field focus:input-active"
          placeholder="e.g. Ethereum"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium" for="rpcUrl"> RPC URL </label>
        <input
          id="rpcUrl"
          v-model="rpcConfig.rpcUrl"
          required
          type="text"
          class="input-field focus:input-active"
          placeholder="e.g. https://rpc.ankr.com/eth"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium" for="currencySymbol">
          Currency Symbol
        </label>
        <input
          id="currencySymbol"
          v-model="rpcConfig.currencySymbol"
          required
          type="text"
          class="input-field focus:input-active"
          placeholder="e.g. ETH"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium" for="chainId"> Chain ID </label>
        <input
          id="chainId"
          v-model="rpcConfig.chainId"
          required
          type="text"
          class="input-field focus:input-active"
          placeholder="e.g. 0x1"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium" for="explorerUrl">
          Explorer URL (Optional)
        </label>
        <input
          id="explorerUrl"
          v-model="rpcConfig.explorerUrl"
          type="text"
          class="input-field focus:input-active"
          placeholder="e.g. https://etherscan.io"
        />
      </div>
      <div class="flex mt-5">
        <button class="btn-primary w-full p-2 uppercase font-bold text-sm">
          Save
        </button>
      </div>
    </form>
  </div>
</template>
