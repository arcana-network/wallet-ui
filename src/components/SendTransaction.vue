<script setup lang="ts">
import { AppMode } from '@arcana/auth'
import { Decimal } from 'decimal.js'
import { ref, onMounted, onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'

import AppLoader from '@/components/AppLoader.vue'
import GasPrice from '@/components/GasPrice.vue'
import SendTransactionCompact from '@/components/SendTransactionCompact.vue'
import SignMessageAdvancedInfo from '@/components/signMessageAdvancedInfo.vue'
import { useAppStore } from '@/store/app'
import useCurrencyStore from '@/store/currencies'
import { useRequestStore } from '@/store/request'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import { EVMAccountHandler, SolanaAccountHandler } from '@/utils/accountHandler'
import { ChainType } from '@/utils/chainType'
import { getRequestHandler } from '@/utils/requestHandlerSingleton'
import { sanitizeRequest } from '@/utils/sanitizeRequest'
import { scwInstance } from '@/utils/scw'
import { truncateMid } from '@/utils/stringUtils'

const props = defineProps({
  request: {
    type: Object,
    required: true,
  },
})

const paymasterBalance = ref(0)
onBeforeMount(async () => {
  paymasterBalance.value = (await scwInstance.getPaymasterBalance()) / 1e18
})

const emits = defineEmits(['gasPriceInput', 'reject', 'approve', 'proceed'])
const customGasPrice = ref({} as any)

const rpcStore = useRpcStore()
const appStore = useAppStore()
const currencyStore = useCurrencyStore()
const userStore = useUserStore()
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
    if (appStore.chainType === ChainType.solana_cv25519) {
      const data = await (accountHandler as SolanaAccountHandler).getFee(
        props.request.request.params[0]
      )
    } else {
      const baseGasPrice = (
        await (accountHandler as EVMAccountHandler).provider.getGasPrice()
      ).toString()
      gasLimit.value = (
        await (accountHandler as EVMAccountHandler).provider.estimateGas({
          ...sanitizeRequest(props.request.request).params[0],
        })
      ).toString()
      baseFee.value = new Decimal(baseGasPrice)
        .div(Decimal.pow(10, 9))
        .toString()
    }
    if (props.request.request.params[0].maxFeePerGas) {
      customGasPrice.value.maxFeePerGas = new Decimal(
        props.request.request.params[0].maxFeePerGas
      )
        .div(Decimal.pow(10, 9))
        .toString()
    } else {
      customGasPrice.value.maxFeePerGas = new Decimal(baseFee.value)
        .add(1.5)
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

function calculateGasPrice(params) {
  if (params.maxFeePerGas || params.gasPrice) {
    return `${new Decimal(getGasValue(params))
      .div(Decimal.pow(10, 18))
      .toDecimalPlaces(10)
      .toString()} ${
      rpcStore.selectedRPCConfig?.nativeCurrency?.symbol || 'Units'
    }`
  }
  return 'Unknown'
}

function getGasValue(params) {
  return `${new Decimal(params.maxFeePerGas || params.gasPrice)
    .add(params.maxPriorityFeePerGas || 1.5)
    .mul(params.gasLimit || params.gas || 21000)
    .toHexadecimal()}`
}

function calculateValue(value) {
  return `${new Decimal(value).div(Decimal.pow(10, 18)).toString()} ${
    rpcStore.selectedRPCConfig?.nativeCurrency?.symbol || 'Units'
  }`
}

function calculateCurrencyValue(value) {
  const rpcSymbol = rpcStore.selectedRpcConfig?.nativeCurrency?.symbol
  if (!rpcSymbol) {
    return null
  }
  const chainType = rpcStore.selectedRpcConfig?.chainType
  if (chainType?.toLowerCase() === 'testnet') {
    return null
  }
  if (rpcStore.selectedRPCConfig?.nativeCurrency?.symbol) {
    const perTokenPrice =
      currencyStore.currencies[rpcStore.selectedRPCConfig.nativeCurrency.symbol]
    if (!perTokenPrice) {
      return null
    }
    const currencySymbol = currencyStore.getCurrencySymbol
    return `${currencySymbol}${new Decimal(value)
      .div(Decimal.pow(10, 18))
      .mul(Decimal.div(1, perTokenPrice))
      .toDecimalPlaces(2)
      .toString()}`
  }
  return null
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
    :base-fee="baseFee"
    @approve="emits('approve')"
    @reject="emits('reject')"
  />
  <div v-else class="card p-4 flex flex-1 flex-col gap-4">
    <div
      v-if="route.name !== 'PermissionRequest'"
      class="flex flex-col space-y-2"
    >
      <p class="text-lg text-center font-bold flex-grow">Send Transaction</p>
      <p class="text-xs text-gray-100 text-center">
        The application “{{ appStore.name }}” is requesting your permission to
        send this transaction to {{ rpcStore.selectedRpcConfig?.chainName }}.
      </p>
    </div>
    <div
      v-if="appStore.chainType === ChainType.evm_secp256k1"
      class="flex flex-col gap-2 text-sm"
    >
      <div class="text-sm font-medium">Transaction Details</div>
      <div
        v-if="request.request?.params[0]?.from"
        class="flex justify-between gap-4"
      >
        <span class="w-[120px]">From</span>
        <span :title="request.request.params[0].from">
          {{ truncateMid(request.request.params[0].from, 6) }}
        </span>
      </div>
      <div v-else class="flex justify-between gap-4">
        <span class="w-[120px]">From</span>
        <span :title="userStore.walletAddress">
          {{ truncateMid(userStore.walletAddress, 6) }}
        </span>
      </div>
      <div
        v-if="request.request?.params[0]?.to"
        class="flex justify-between gap-4"
      >
        <span class="w-[120px]">To</span>
        <span :title="request.request.params[0].to">{{
          truncateMid(request.request.params[0].to, 6)
        }}</span>
      </div>
      <div
        v-if="request.request?.params[0]?.value"
        class="flex justify-between gap-4"
      >
        <span>Value</span>
        <span class="text-right">
          <span :title="calculateValue(request.request.params[0].value)">{{
            calculateValue(request.request.params[0].value)
          }}</span>
          <span
            v-if="calculateCurrencyValue(request.request.params[0].value)"
            class="ml-1"
          >
            ({{ calculateCurrencyValue(request.request.params[0].value) }})
          </span>
        </span>
      </div>
      <div class="flex justify-between gap-4">
        <span>Transaction Fee</span>
        <span class="text-right">
          <span
            v-if="!rpcStore.useGasless"
            :title="calculateGasPrice(request.request.params[0])"
            >{{ calculateGasPrice(request.request.params[0]) }}</span
          >
          <span
            v-else-if="rpcStore.useGasless && paymasterBalance >= 0.1"
            class="text-right text-green-100"
          >
            Sponsored
          </span>
          <span
            v-else-if="rpcStore.useGasless && paymasterBalance < 0.1"
            class="text-right"
          >
            {{ calculateGasPrice(request.request.params[0]) }}
          </span>
          <span
            v-if="
              calculateCurrencyValue(getGasValue(request.request.params[0]))
            "
            class="ml-1"
          >
            ({{
              calculateCurrencyValue(getGasValue(request.request.params[0]))
            }})
          </span>
        </span>
      </div>
      <div
        v-if="request.request.params[0].data"
        class="flex flex-col gap-1 h-40"
      >
        <span>Message</span>
        <SignMessageAdvancedInfo :info="request.request.params[0].data" />
      </div>
    </div>
    <div
      v-else-if="appStore.chainType === ChainType.solana_cv25519"
      class="flex flex-col gap-2 text-sm"
    >
      <div class="text-sm font-medium">Transaction Details</div>
      <div class="flex flex-col gap-1">
        <span>Data</span>
        <SignMessageAdvancedInfo :info="request.request.params.message" />
      </div>
    </div>
    <div
      v-if="appStore.chainType === ChainType.evm_secp256k1"
      class="mt-4 text-center"
    >
      <GasPrice
        v-if="
          !rpcStore.useGasless ||
          (rpcStore.useGasless && paymasterBalance < 0.1)
        "
        :base-fee="baseFee"
        :gas-limit="gasLimit"
        :max-fee-per-gas="customGasPrice.maxFeePerGas"
        :max-priority-fee-per-gas="customGasPrice.maxPriorityFeePerGas"
        @gas-price-input="handleSetGasPrice"
      />
      <span
        v-if="rpcStore.useGasless && paymasterBalance > 0.1"
        class="text-xs text-green-100 font-medium text-center w-full"
        >This is a Gasless Transaction. Click Below to Approve.
      </span>
    </div>
    <div
      v-if="route.name !== 'PermissionRequest'"
      class="mt-auto flex flex-col gap-4"
    >
      <div v-if="request.requestOrigin === 'auth-verify'">
        <button
          class="btn-secondary p-2 uppercase w-full text-sm font-bold"
          @click="emits('proceed')"
        >
          Proceed
        </button>
      </div>
      <div v-else class="flex gap-2">
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
