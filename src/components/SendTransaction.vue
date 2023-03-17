<script setup lang="ts">
import { ethers } from 'ethers'
import { ref, onMounted } from 'vue'
import type { Ref } from 'vue'

import AppLoader from '@/components/AppLoader.vue'
import GasPrice from '@/components/GasPrice.vue'
import SignMessageAdvancedInfo from '@/components/signMessageAdvancedInfo.vue'
import {
  getGasPrice,
  GAS_AVAILABLE_CHAIN_IDS,
} from '@/services/gasPrice.service'
import { useAppStore } from '@/store/app'
import { useRpcStore } from '@/store/rpc'
import { advancedInfo } from '@/utils/advancedInfo'
import { getEthereumRequestHandler } from '@/utils/evm/requestHandlerSingleton'
import { useImage } from '@/utils/useImage'

const props = defineProps({
  request: {
    type: Request,
    required: true,
  },
})

const emits = defineEmits(['gasPriceInput'])
const customGasPrice = ref('')

const rpcStore = useRpcStore()
const appStore = useAppStore()
const getImage = useImage()
const baseFee = ref('0')
const chainId = Number(rpcStore.selectedChainId)

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
  showLoader('Loading...')
  try {
    if (GAS_AVAILABLE_CHAIN_IDS.includes(chainId)) {
      const data = await getGasPrice(chainId)
      gasPrices.value = data
    }
    const accountHandler = getEthereumRequestHandler().getAccountHandler()
    const baseGasPrice = (
      await accountHandler.provider.getGasPrice()
    ).toString()
    baseFee.value = ethers.utils.formatUnits(baseGasPrice, 'gwei')
  } catch (err) {
    console.log({ err })
    gasPrices.value = {}
  } finally {
    hideLoader()
  }
})

function handleSetGasPrice(value) {
  const requestId = props.request.request.id
  customGasPrice.value = value
  emits('gasPriceInput', {
    value: `0x${Number(value * Math.pow(10, 9)).toString(16)}`,
    requestId,
  })
}
</script>

<template>
  <div v-if="loader.show" class="flex justify-center items-center flex-1">
    <AppLoader :message="loader.message" />
  </div>
  <div v-else class="flex flex-1 flex-col space-y-4 sm:space-y-3">
    <div class="flex flex-col space-y-2">
      <div class="flex justify-between">
        <p class="text-xl sm:text-sm font-semibold">Send Transaction</p>
      </div>
      <p class="text-xs text-zinc-400">
        {{ appStore.name }} requests your permission to send this transaction to
        the {{ rpcStore.selectedRpcConfig?.chainName }}. Please specify gas
        while submitting the transaction.
      </p>
    </div>
    <div class="space-y-1">
      <p class="text-xs text-zinc-400">Network</p>
      <p class="text-base sm:text-sm flex gap-2">
        <img
          :src="getImage(rpcStore.selectedRpcConfig.favicon)"
          class="w-6 h-6"
        />
        {{ rpcStore.selectedRpcConfig?.chainName }}
      </p>
    </div>
    <div class="space-y-1">
      <label
        class="text-xs text-zinc-400 font-semibold"
        for="recipientWalletAddress"
      >
        Origin
      </label>
      <p
        class="max-w-full truncate text-base sm:text-sm text-zinc-400 rounded-lg p-3 sm:p-1 bg-gradient"
      >
        {{ request.request.params[0].from }}
      </p>
    </div>
    <GasPrice
      :gas-price="customGasPrice"
      :gas-prices="gasPrices"
      :base-fee="baseFee"
      @gas-price-input="handleSetGasPrice"
    />
    <SignMessageAdvancedInfo
      :info="advancedInfo(request.request.method, request.request.params[0])"
    />
  </div>
</template>
