<script setup lang="ts">
import { type Ref, onMounted, ref, watch } from 'vue'

import type { CurrencySymbol } from '@/services/exchangeRate.service'
import { getExchangeRate } from '@/services/exchangeRate.service'
import { GAS_AVAILABLE_CHAIN_IDS } from '@/services/gasPrice.service'
import { useRpcStore } from '@/store/rpc'
import {
  EXCHANGE_RATE_CURRENCY,
  GAS_FEE_UNIT,
  GAS_PRICE_SPEED_MAP,
} from '@/utils/constants'
import debounce from '@/utils/debounce'
import { formatValueToUSD } from '@/utils/formatUSD'
import { convertGweiToEth } from '@/utils/gweiToEth'
import { useImage } from '@/utils/useImage'

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

const rpcStore = useRpcStore()

const gasFee = ref(0)
const transactionTime = ref(null)
const conversionRate = ref('')
const isGasPriceFocused = ref(false)
const selectedGasMethod: Ref<'normal' | 'fast' | 'custom'> = ref('normal')

const getConversionRateDebounced = debounce(getConversionRate)

watch(gasFee, () => {
  if (rpcStore.currency) getConversionRateDebounced(gasFee.value)
})

const getImage = useImage()
const showCustomGasFeeInput = ref(false)

const hasGasStation = GAS_AVAILABLE_CHAIN_IDS.includes(
  Number(rpcStore.selectedChainId)
)

async function getConversionRate(gasFee) {
  if (rpcStore.currency === 'XAR') return (conversionRate.value = '0')
  if (!gasFee) return (conversionRate.value = '0')
  try {
    const rate =
      (await getExchangeRate(
        rpcStore.currency as CurrencySymbol,
        EXCHANGE_RATE_CURRENCY
      )) || 0
    const gasFeeInEth = convertGweiToEth(gasFee)
    conversionRate.value = formatValueToUSD(Number(gasFeeInEth) * rate)
  } catch (err) {
    console.log(err)
    conversionRate.value = '0'
  }
}

function handleGasPriceSelect(value = '') {
  const type = value.toLowerCase()
  const { wait, price } = GAS_PRICE_SPEED_MAP[type]
  gasFee.value = Number((props.gasPrices[price] / 10).toFixed(9))
  transactionTime.value = props.gasPrices[wait]
  emits('gasPriceInput', gasFee.value)
}

function handleCustomGasPriceInput(value) {
  const amountInputEl = document.querySelector(
    '#custom-gas-fee-amount'
  ) as HTMLInputElement
  if (!value && value !== 0) {
    amountInputEl.setCustomValidity('Enter the gas fees to continue.')
  } else if (value < Number(props.baseFee)) {
    amountInputEl.setCustomValidity('Gas fees must not be less than base fees.')
  } else {
    amountInputEl.setCustomValidity('')
  }
  gasFee.value = value
  emits('gasPriceInput', gasFee.value)
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <div class="flex justify-between items-baseline">
      <span class="text-sm font-medium">Gas Fees</span>
      <div class="text-xs font-normal">
        <span class="text-gray-100">Transaction Time:</span>
        <span class="text-black-500 dark:text-white-100">
          ~{{ hasGasStation ? '-' : transactionTime }} mins
        </span>
      </div>
    </div>
    <div class="card flex p-1">
      <div
        class="p-1 w-full text-center text-base font-normal cursor-pointer rounded-sm hover:bg-black-500 dark:hover:bg-black-300 focus-visible:bg-black-500 dark:focus-visible:bg-black-300"
        :class="{
          'bg-black-500 dark:bg-black-300 text-white-100':
            selectedGasMethod === 'normal',
          'text-gray-100': selectedGasMethod !== 'normal',
        }"
        @click.stop="selectedGasMethod = 'normal'"
      >
        Normal
      </div>
      <div
        class="p-1 w-full text-center text-base font-normal cursor-pointer rounded-sm hover:bg-black-500 dark:hover:bg-black-300 focus-visible:bg-black-500 dark:focus-visible:bg-black-300"
        :class="{
          'cursor-not-allowed opacity-60 pointer-events-none': !hasGasStation,
          'bg-black-500 dark:bg-black-300 text-white-100':
            selectedGasMethod === 'fast',
          'text-gray-100': selectedGasMethod !== 'fast',
        }"
        @click.stop="hasGasStation ? (selectedGasMethod = 'fast') : void 0"
      >
        Fast
      </div>
      <div
        class="p-1 w-full text-center text-base font-normal cursor-pointer rounded-sm hover:bg-black-500 dark:hover:bg-black-300 focus-visible:bg-black-500 dark:focus-visible:bg-black-300"
        :class="{
          'bg-black-500 dark:bg-black-300 text-white-100':
            selectedGasMethod === 'custom',
          'text-gray-100': selectedGasMethod !== 'custom',
        }"
        @click.stop="selectedGasMethod = 'custom'"
      >
        Custom
      </div>
    </div>
  </div>
  <div v-if="selectedGasMethod === 'custom'" class="space-y-1">
    <div class="space-x-1 mb-2 text-xs text-zinc-400">
      <span class="font-semibold">Base Fee:</span>
      <span class="text-black dark:text-white">{{ props.baseFee }} Gwei</span>
    </div>
    <div class="flex justify-between sm:flex-col sm:space-y-1">
      <label class="text-xs text-zinc-400 font-semibold" for="amount">
        Set Custom Fee
      </label>
      <p v-if="rpcStore.currency" class="space-x-1 text-xs text-zinc-400">
        <span>Conversion Rate:</span>
        <span class="text-black dark:text-white">{{
          conversionRate || 'NA'
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
