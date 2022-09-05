<script setup lang="ts">
import { onMounted, Ref, ref } from 'vue'

import GasPriceSlider from '@/components/GasPriceSlider.vue'
import type { CurrencySymbol } from '@/services/exchangeRate.service'
import { getExchangeRate } from '@/services/exchangeRate.service'
import { getGasPrice } from '@/services/gasPrice.service'
import { useRpcStore } from '@/store/rpc'
import { useImage } from '@/utils/useImage'

const EXCHANGE_RATE_CURRENCY: CurrencySymbol = 'USD'

const emits = defineEmits(['gasPriceInput'])

onMounted(init)

const rpcStore = useRpcStore()

const gasFees = ref(0)
const transactionTime = ref(null)
const conversionRate = ref(0)

const disableSlider = ref(true)

const getImage = useImage()
const showCustomGasFeeInput = ref(false)
const gasPrices: Ref<object> = ref({})
const gasPriceLabelPropsMap = {
  slow: { wait: 'safeLowWait', price: 'safeLow' },
  average: { wait: 'avgWait', price: 'average' },
  fast: { wait: 'fastWait', price: 'fast' },
  fastest: { wait: 'fastestWait', price: 'fastest' },
}

function init() {
  fetchGasPrices()
  if (!rpcStore.currency) showCustomGasFeeInput.value = true
}

async function fetchGasPrices() {
  try {
    const data = await getGasPrice()
    gasPrices.value = data
  } catch (err) {
    console.log({ err })
    gasPrices.value = {}
  }
}

function handleGasPriceSelect(value = '') {
  disableSlider.value = false
  const type = value.toLowerCase()
  const { wait, price } = gasPriceLabelPropsMap[type]
  const gasFessInGwei = gasPrices.value[price] / 10
  const decimal = rpcStore.rpcConfig?.nativeCurrency?.decimals || 9
  gasFees.value = gasFessInGwei / Math.pow(10, decimal)
  transactionTime.value = gasPrices.value[wait]
  emits('gasPriceInput', gasFees.value)
}

function onCustomGasPriceInput(value) {
  disableSlider.value = true
  gasFees.value = value
  emits('gasPriceInput', gasFees.value)
  if (rpcStore.currency) getConversionRate(gasFees.value)
}

async function getConversionRate(gasFees) {
  try {
    const rate = await getCurrencyExchangeRate()
    conversionRate.value = Number(gasFees) * rate
  } catch (err) {
    console.log(err)
    conversionRate.value = 0
  }
}

async function getCurrencyExchangeRate() {
  try {
    const rate = await getExchangeRate(
      rpcStore.currency as CurrencySymbol,
      EXCHANGE_RATE_CURRENCY
    )
    if (rate) return rate
  } catch (err) {
    console.error(err)
    return 0
  }
}
</script>

<template>
  <div>
    <div v-if="rpcStore.currency" class="space-y-[10px]">
      <div class="flex justify-between sm:flex-col">
        <div class="space-x-1 flex items-baseline">
          <span class="text-xs text-zinc-400">Gas Fees</span>
          <div class="space-x-1">
            <span class="sm:text-xs">{{ disableSlider ? '-' : gasFees }}</span>
            <span class="text-xs">{{ rpcStore.currency }}</span>
          </div>
        </div>
        <div class="space-x-1">
          <span class="text-xs text-zinc-400">Transaction Time:</span>
          <span class="text-xs">
            ~{{ disableSlider ? '-' : transactionTime }} mins
          </span>
        </div>
      </div>
      <div class="px-4">
        <GasPriceSlider
          :disable="disableSlider"
          @select-gas-price="handleGasPriceSelect"
        />
      </div>
    </div>
    <button
      v-if="rpcStore.currency"
      class="flex justify-center items-center m-auto space-x-1 mt-5"
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
      <div class="flex justify-between sm:flex-col sm:space-y-1">
        <label class="text-xs text-zinc-400" for="amount"> Custom Fee </label>
        <p v-if="rpcStore.currency" class="space-x-1 text-xs text-zinc-400">
          <span>Conversion Rate:</span>
          <span class="text-white"
            >{{ conversionRate }} {{ EXCHANGE_RATE_CURRENCY }}</span
          >
        </p>
      </div>
      <div class="flex divide-x space-x-1 p-2 sm:p-1 bg-gradient rounded-lg">
        <input
          id="amount"
          autocomplete="off"
          type="text"
          class="text-base sm:text-sm bg-gradient w-full rounded-lg border-none outline-none"
          placeholder="0.5"
          @input="(evt) => onCustomGasPriceInput(evt.target.value)"
        />
        <div
          v-if="rpcStore.currency"
          class="p-2"
          :class="{
            'border-l-[1px] border-l-slate-400 px-1': rpcStore.currency,
          }"
        >
          <p class="text-sm pl-1">{{ rpcStore.currency }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
