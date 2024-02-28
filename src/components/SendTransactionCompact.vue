<script setup lang="ts">
import { AppMode } from '@arcana/auth'
import { Decimal } from 'decimal.js'
import { computed, onMounted, onBeforeMount, ref } from 'vue'
import { useRoute } from 'vue-router'

import { useAppStore } from '@/store/app'
import useCurrencyStore from '@/store/currencies'
import { useParentConnectionStore } from '@/store/parentConnection'
import { useRequestStore } from '@/store/request'
import { useRpcStore } from '@/store/rpc'
import { ChainType } from '@/utils/chainType'
import { getImage } from '@/utils/getImage'
import { scwInstance } from '@/utils/scw'

const emits = defineEmits(['reject', 'approve'])

const rpcStore = useRpcStore()
const appStore = useAppStore()
const parentConnectionStore = useParentConnectionStore()
const requestStore = useRequestStore()
const route = useRoute()
const currencyStore = useCurrencyStore()

const loader = ref({
  show: false,
  message: '',
})

const paymasterBalance = ref(0)
onBeforeMount(async () => {
  loader.value.show = true
  if (appStore.chainType === ChainType.evm_secp256k1 && rpcStore.useGasless) {
    paymasterBalance.value = (await scwInstance.getPaymasterBalance()) / 1e18
  }
  loader.value.show = false
})
const props = defineProps({
  request: {
    type: Object,
    required: true,
  },
  gasLimit: {
    type: String,
    required: false,
    default: '',
  },
  gas: {
    type: Object,
    required: true,
  },
  baseFee: {
    type: String,
    required: false,
    default: '',
  },
})

onMounted(async () => {
  setHeight()
})

const gasFee = computed(() => {
  if (props.gas?.maxFeePerGas) {
    return new Decimal(props.gas.maxFeePerGas || props.baseFee)
      .add(props.gas.maxPriorityFeePerGas || 1.5)
      .mul(Decimal.pow(10, 9))
      .mul(props.gasLimit)
      .div(Decimal.pow(10, 18))
      .toString()
  }
  return 'Unknown'
})

const gasFeeInCurrency = computed(() => {
  if (gasFee.value === 'Unknown') {
    return null
  }
  const rpcSymbol = rpcStore.selectedRpcConfig?.nativeCurrency?.symbol
  if (!rpcSymbol) {
    return null
  }
  const chainType = rpcStore.selectedRpcConfig?.chainType
  if (chainType?.toLowerCase() === 'testnet') {
    return null
  }
  const perTokenPrice = currencyStore.currencies[rpcSymbol]
  if (!perTokenPrice) {
    return null
  }
  return new Decimal(gasFee.value)
    .mul(Decimal.div(1, perTokenPrice))
    .toDecimalPlaces(2)
    .toString()
})

async function setHeight() {
  const parentConnectionInstance = await parentConnectionStore.parentConnection
    ?.promise
  await parentConnectionInstance?.setIframeStyle({
    ...appStore.iframeStyle(),
  })
}

async function onViewDetails() {
  const c = await parentConnectionStore.parentConnection?.promise
  if (appStore.compactMode) {
    appStore.compactMode = false
  } else {
    appStore.standaloneMode == 1 || appStore.standaloneMode == 2
      ? c?.uiEvent('wallet_close', null)
      : (appStore.expandWallet = false)
  }
}
</script>

<template>
  <div class="card p-4 flex flex-col h-full gap-4 justify-between">
    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-center">
        <h1 class="m-0 font-bold text-lg capitalize">Send Transaction</h1>
      </div>
      <p class="text-xs text-gray-100 text-center">
        The application “{{ appStore.name }}” is requesting your permission to
        send this transaction to {{ rpcStore.selectedRpcConfig?.chainName }}.
      </p>
    </div>
    <div class="flex flex-col gap-1 flex-1">
      <div class="flex justify-center">
        <div class="flex flex-col justify-center items-center">
          <span class="text-sm text-gray-100">Transaction Fees</span>
          <div class="flex gap-2 items-baseline justify-center">
            <span v-if="loader.show" class="text-sm font-medium"
              >Loading...</span
            >
            <div
              v-else-if="!loader.show && !rpcStore.useGasless"
              class="flex items-baseline"
            >
              <span class="text-lg font-bold"
                >{{ gasFee.slice(0, 9) }}&nbsp;</span
              ><span v-if="gasFee !== 'Unknown'" class="text-sm">{{
                rpcStore.selectedRPCConfig?.nativeCurrency?.symbol || 'Units'
              }}</span>
            </div>
            <span
              v-else-if="
                !loader.show && rpcStore.useGasless && paymasterBalance >= 0.1
              "
              class="text-sm font-medium text-green-100"
            >
              Sponsored
            </span>
            <div
              v-else-if="
                !loader.show && rpcStore.useGasless && paymasterBalance < 0.1
              "
              class="flex-col text-center items-baseline"
            >
              <span class="text-lg font-bold"
                >{{ gasFee.slice(0, 9) }}&nbsp;</span
              ><span v-if="gasFee !== 'Unknown'" class="text-sm">{{
                rpcStore.selectedRPCConfig?.nativeCurrency?.symbol || 'Units'
              }}</span>
            </div>
            <div
              v-if="gasFee !== 'Unknown' && gasFeeInCurrency"
              class="text-sm font-medium"
            >
              ({{ currencyStore.getCurrencySymbol }}{{ gasFeeInCurrency }})
            </div>
          </div>
        </div>
      </div>
      <button
        class="text-xs mt-2 text-center flex gap-1 items-center justify-center mx-auto uppercase font-bold"
        @click.stop="onViewDetails"
      >
        View Details
        <img :src="getImage('arrow-down.svg')" />
      </button>
    </div>
    <div class="flex flex-col gap-4">
      <div class="flex gap-2 text-sm font-bold">
        <button
          class="uppercase w-full btn-secondary p-2"
          @click="emits('reject')"
        >
          Reject
        </button>
        <button
          class="uppercase w-full btn-primary p-2"
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
