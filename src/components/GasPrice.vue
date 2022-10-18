<script setup lang="ts">
import { ethers } from 'ethers'
import { onMounted, ref, watch } from 'vue'

import GasPriceSlider from '@/components/GasPriceSlider.vue'
import type { CurrencySymbol } from '@/services/exchangeRate.service'
import { getExchangeRate } from '@/services/exchangeRate.service'
import { GAS_AVAILABLE_CHAIN_IDS } from '@/services/gasPrice.service'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import { AccountHandler } from '@/utils/accountHandler'
import debounce from '@/utils/debounce'
import { formatValueToUSD } from '@/utils/formatUSD'
import { convertGweiToEth } from '@/utils/gweiToEth'
import { useImage } from '@/utils/useImage'

const EXCHANGE_RATE_CURRENCY: CurrencySymbol = 'USD'
const GAS_FEE_UNIT = 'GWEI'

const emits = defineEmits(['gasPriceInput'])

const props = defineProps({
  gasPrices: {
    type: Object,
    required: false,
    default: () => ({}),
  },
  gasPrice: {
    type: String,
    default: '',
  },
  baseFee: {
    type: String,
    default: '0',
  },
})

onMounted(init)

const rpcStore = useRpcStore()
const userStore = useUserStore()

const accountHandler = new AccountHandler(userStore.privateKey)
accountHandler.setProvider(rpcStore.selectedRpcConfig.rpcUrls[0])

const gasFee = ref(0)
const transactionTime = ref(null)
const conversionRate = ref('')
const isGasPriceFocused = ref(false)

const disableSlider = ref(true)

const getConversionRateDebounced = debounce(getConversionRate)

watch(gasFee, () => {
  if (rpcStore.currency) getConversionRateDebounced(gasFee.value)
})

const getImage = useImage()
const showCustomGasFeeInput = ref(false)
const gasPriceLabelPropsMap = {
  slow: { wait: 'safeLowWait', price: 'safeLow' },
  standard: { wait: 'avgWait', price: 'average' },
  fast: { wait: 'fastWait', price: 'fast' },
}

const showSlider = GAS_AVAILABLE_CHAIN_IDS.includes(rpcStore.selectedChainId)

async function init() {
  showCustomGasFeeInput.value = !showSlider
}

async function getConversionRate(gasFee) {
  if (rpcStore.currency === 'XAR') return 0
  try {
    if (gasFee) {
      const rate =
        (await getExchangeRate(
          rpcStore.currency as CurrencySymbol,
          EXCHANGE_RATE_CURRENCY
        )) || 0
      const gasFeeInEth = convertGweiToEth(gasFee)
      conversionRate.value = formatValueToUSD(Number(gasFeeInEth) * rate)
    }
  } catch (err) {
    console.log(err)
    conversionRate.value = '0'
  }
}

function handleGasPriceSelect(value = '') {
  disableSlider.value = false
  const type = value.toLowerCase()
  const { wait, price } = gasPriceLabelPropsMap[type]
  gasFee.value = Number((props.gasPrices[price] / 10).toFixed(9))
  transactionTime.value = props.gasPrices[wait]
  emits('gasPriceInput', gasFee.value)
}

function handleCustomGasPriceInput(value) {
  disableSlider.value = true
  if (value) {
    const amountInputEl = document.querySelector(
      '#custom-gas-fee-amount'
    ) as HTMLInputElement
    if (value < Number(props.baseFee)) {
      return amountInputEl.setCustomValidity(
        'Amount must not be less than base fee.'
      )
    } else {
      amountInputEl.setCustomValidity('')
      gasFee.value = value
      emits('gasPriceInput', gasFee.value)
    }
  }
}
</script>

<template>
  <div v-if="showSlider" class="space-y-[10px]">
    <div class="flex flex-col justify-between">
      <div class="space-x-1 flex items-baseline">
        <span class="text-xs text-zinc-400">Gas Fees</span>
        <div class="space-x-1">
          <span class="sm:text-xs">{{ disableSlider ? '-' : gasFee }}</span>
          <span class="text-xs">{{ GAS_FEE_UNIT }}</span>
        </div>
      </div>
      <div class="space-x-1">
        <span class="text-xs text-zinc-400">Transaction Time:</span>
        <span class="text-xs">
          ~{{ disableSlider ? '-' : transactionTime }} mins
        </span>
      </div>
    </div>
    <div class="px-6">
      <GasPriceSlider
        :disable="disableSlider"
        @select-gas-price="handleGasPriceSelect"
      />
    </div>
  </div>
  <button
    v-if="showSlider"
    class="flex justify-center items-center mx-auto"
    style="margin-top: 2.5rem"
    @click.prevent="showCustomGasFeeInput = !showCustomGasFeeInput"
  >
    <p class="text-xs">Advanced Option</p>
    <img
      :src="getImage('arrow-icon')"
      alt="arrow icon"
      class="w-4 transition-transform duration-500"
      :class="{ 'rotate-180': showCustomGasFeeInput }"
    />
  </button>
  <div v-if="showCustomGasFeeInput" class="space-y-1">
    <div class="space-x-1 mb-2 text-xs text-zinc-400">
      <span>Base Fee:</span>
      <span class="text-black dark:text-white">{{ props.baseFee }}</span>
    </div>
    <div class="flex justify-between sm:flex-col sm:space-y-1">
      <label class="text-xs text-zinc-400" for="amount"> Custom Fee </label>
      <p v-if="rpcStore.currency" class="space-x-1 text-xs text-zinc-400">
        <span>Conversion Rate:</span>
        <span class="text-black dark:text-white">{{
          conversionRate || 0
        }}</span>
      </p>
    </div>
    <div
      class="flex divide-x space-x-1 p-2 sm:p-1 input rounded-lg"
      :class="{
        'outline-black dark:outline-white outline-1 outline': isGasPriceFocused,
      }"
    >
      <input
        id="custom-gas-fee-amount"
        :value="props.gasPrice"
        autocomplete="off"
        type="text"
        class="text-base sm:text-sm bg-transparent w-full rounded-lg border-none outline-none"
        placeholder="0.5"
        @input="(evt) => handleCustomGasPriceInput(evt.target.value)"
        @focus="isGasPriceFocused = true"
        @blur="isGasPriceFocused = false"
      />
      <div class="p-2 border-l-[1px] border-l-slate-400 px-1">
        <p
          class="text-sm pl-1 w-[4.375rem] text-ellipsis whitespace-nowrap overflow-hidden"
        >
          {{ GAS_FEE_UNIT }}
        </p>
      </div>
    </div>
  </div>
</template>
