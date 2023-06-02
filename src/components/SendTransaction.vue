<script setup lang="ts">
import { ethers } from 'ethers'
import { ref, onMounted } from 'vue'
import type { Ref } from 'vue'

import AppLoader from '@/components/AppLoader.vue'
import GasPrice from '@/components/GasPrice.vue'
import SendTransactionCompact from '@/components/SendTransactionCompact.vue'
import SignMessageAdvancedInfo from '@/components/signMessageAdvancedInfo.vue'
import {
  getGasPrice,
  GAS_AVAILABLE_CHAIN_IDS,
} from '@/services/gasPrice.service'
import { useAppStore } from '@/store/app'
import { useRpcStore } from '@/store/rpc'
import { advancedInfo } from '@/utils/advancedInfo'
import { getRequestHandler } from '@/utils/requestHandlerSingleton'
import { useImage } from '@/utils/useImage'

const props = defineProps({
  request: {
    type: Object,
    required: true,
  },
})

const emits = defineEmits(['gasPriceInput', 'reject', 'approve'])
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
    const accountHandler = getRequestHandler().getAccountHandler()
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
  console.log('handleSetGasPrice', { value })
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
  <SendTransactionCompact
    v-else-if="appStore.compactMode"
    :gas-price="customGasPrice"
    :gas-prices="gasPrices"
    :request="request"
    @approve="emits('approve')"
    @reject="emits('reject')"
  />
  <div v-else class="card p-4 flex flex-1 flex-col gap-4">
    <div class="flex flex-col space-y-2">
      <p class="text-lg text-center font-bold flex-grow">Send Transaction</p>
      <p class="text-xs text-gray-100 text-center">
        The application “{{ appStore.name }}” is requesting your permission to
        send this transaction to {{ rpcStore.selectedRpcConfig?.chainName }}. Do
        you approve the transaction?
      </p>
    </div>
    <div class="flex flex-col gap-1">
      <div class="text-sm">Message</div>
      <SignMessageAdvancedInfo
        :info="advancedInfo(request.request.method, request.request.params[0])"
      />
    </div>
    <GasPrice
      :gas-price="customGasPrice"
      :gas-prices="gasPrices"
      :base-fee="baseFee"
      @gas-price-input="handleSetGasPrice"
    />
    <div class="mt-auto flex gap-2">
      <button
        class="btn-secondary p-2 uppercase w-full text-sm font-bold"
        @click="emits('reject')"
      >
        Reject
      </button>
      <button
        class="btn-primary p-2 uppercase w-full text-sm font-bold"
        @click="emits('approve')"
      >
        Approve
      </button>
    </div>
  </div>
</template>
