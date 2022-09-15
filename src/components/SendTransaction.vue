<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Ref } from 'vue'

import GasPrice from '@/components/GasPrice.vue'
import SignMessageAdvancedInfo from '@/components/signMessageAdvancedInfo.vue'
import { getGasPrice } from '@/services/gasPrice.service'
import { useAppStore } from '@/store/app'
import { useRpcStore } from '@/store/rpc'
import { advancedInfo } from '@/utils/advancedInfo'

const props = defineProps({
  request: {
    type: Request,
    required: true,
  },
})

const emits = defineEmits(['gasPriceInput'])

const rpcStore = useRpcStore()
const appStore = useAppStore()

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
  const requestId = props.request.request.id
  emits('gasPriceInput', { value, requestId })
}
</script>

<template>
  <div class="flex flex-1 flex-col space-y-4 sm:space-y-3">
    <div class="flex flex-col space-y-2">
      <div class="flex justify-between">
        <p class="text-xl sm:text-sm">Send Transaction</p>
      </div>
      <p class="text-xs text-zinc-400">
        {{ appStore.name }} requests your permission to send this transaction to
        the {{ rpcStore.rpcConfig?.chainName }}. Please specify gas while
        submitting the transaction.
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
        class="max-w-full truncate text-base sm:text-sm text-zinc-400 rounded-lg p-3 sm:p-1 bg-gradient"
      >
        {{ request.request.params[0].from }}
      </p>
    </div>
    <GasPrice
      :gas-price="request.request.params[0].gasPrice"
      :gas-prices="gasPrices"
      @gas-price-input="handleSetGasPrice"
    />
    <SignMessageAdvancedInfo
      :info="advancedInfo(request.request.method, request.request.params[0])"
    />
  </div>
</template>
