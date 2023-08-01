<script setup lang="ts">
import { AppMode } from '@arcana/auth'
import { Decimal } from 'decimal.js'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import AppLoader from '@/components/AppLoader.vue'
import GasPrice from '@/components/GasPrice.vue'
import SendTransactionCompact from '@/components/SendTransactionCompact.vue'
import SignMessageAdvancedInfo from '@/components/signMessageAdvancedInfo.vue'
import { useAppStore } from '@/store/app'
import { useRequestStore } from '@/store/request'
import { useRpcStore } from '@/store/rpc'
import { advancedInfo } from '@/utils/advancedInfo'
import { getRequestHandler } from '@/utils/requestHandlerSingleton'
import { sanitizeRequest } from '@/utils/sanitizeRequest'

const props = defineProps({
  request: {
    type: Object,
    required: true,
  },
})

const emits = defineEmits(['gasPriceInput', 'reject', 'approve'])
const customGasPrice = ref({} as any)

const rpcStore = useRpcStore()
const appStore = useAppStore()
const baseFee = ref('0')
const gasLimit = ref('0')
const requestStore = useRequestStore()
const route = useRoute()

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
    const accountHandler = getRequestHandler().getAccountHandler()
    const baseGasPrice = (
      await accountHandler.provider.getGasPrice()
    ).toString()
    gasLimit.value = (
      await accountHandler.provider.estimateGas({
        ...sanitizeRequest(props.request.request).params[0],
      })
    ).toString()
    baseFee.value = new Decimal(baseGasPrice).div(Decimal.pow(10, 9)).toString()
    if (props.request.request.params[0].maxFeePerGas) {
      customGasPrice.value.maxFeePerGas = new Decimal(
        props.request.request.params[0].maxFeePerGas
      )
        .div(Decimal.pow(10, 9))
        .toString()
    }
    if (props.request.request.params[0].maxPriorityFeePerGas) {
      customGasPrice.value.maxPriorityFeePerGas = new Decimal(
        props.request.request.params[0].maxPriorityFeePerGas
      )
        .div(Decimal.pow(10, 9))
        .toString()
    }
    customGasPrice.value.gasLimit =
      props.request.request.params[0].gasLimit || gasLimit.value
    handleSetGasPrice(customGasPrice.value)
  } catch (err) {
    console.log({ err })
  } finally {
    hideLoader()
  }
})

function computeMaxFee(value) {
  return new Decimal(value.maxFeePerGas)
    .add(value.maxPriorityFeePerGas || 1.5)
    .toString()
}

function handleSetGasPrice(value) {
  const requestId = props.request.request.id
  customGasPrice.value = value
  emits('gasPriceInput', {
    value: {
      maxFeePerGas: value.maxFeePerGas
        ? new Decimal(computeMaxFee(value))
            .mul(Decimal.pow(10, 9))
            .toHexadecimal()
        : null,
      maxPriorityFeePerGas: value.maxPriorityFeePerGas
        ? new Decimal(value.maxPriorityFeePerGas)
            .mul(Decimal.pow(10, 9))
            .toHexadecimal()
        : null,
      gasLimit: value.gasLimit ? value.gasLimit : null,
    },
    requestId,
  })
}
</script>

<template>
  <div v-if="loader.show" class="flex justify-center items-center flex-1 p-4">
    <AppLoader :message="loader.message" />
  </div>
  <SendTransactionCompact
    v-else-if="appStore.compactMode"
    :request="request"
    :gas="customGasPrice"
    :gas-limit="gasLimit"
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
      :base-fee="baseFee"
      :gas-limit="gasLimit"
      :max-fee-per-gas="customGasPrice.maxFeePerGas"
      :max-priority-fee-per-gas="customGasPrice.maxPriorityFeePerGas"
      @gas-price-input="handleSetGasPrice"
    />
    <div class="mt-auto flex flex-col gap-4">
      <div class="flex gap-2">
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
      <div
        v-if="
          route.name === 'requests' && appStore.validAppMode === AppMode.Full
        "
        class="flex items-center justify-center"
      >
        <button
          class="btn-tertiary text-sm font-bold"
          @click.stop="requestStore.skipRequest(request.request.id)"
        >
          Do this later
        </button>
      </div>
    </div>
  </div>
</template>
