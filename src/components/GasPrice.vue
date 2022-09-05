<script setup lang="ts">
import { onMounted, Ref, ref } from 'vue'

import GasPriceSlider from '@/components/GasPriceSlider.vue'
import { getGasPrice } from '@/services/gasPrice.service'
import { useRpcStore } from '@/store/rpc'
import { useImage } from '@/utils/useImage'

const emits = defineEmits(['gasPriceInput'])

onMounted(fetchGasPrices)

const rpcStore = useRpcStore()

const gasFees = ref(0)
const transactionTime = ref(null)

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
  gasFees.value = gasPrices.value[price] / 10
  transactionTime.value = gasPrices.value[wait]
  emits('gasPriceInput', gasFees.value)
}

function onCustomGasPriceInput(value) {
  disableSlider.value = true
  gasFees.value = value
  emits('gasPriceInput', gasFees.value)
}
</script>

<template>
  <div>
    <div class="space-y-[10px]">
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
        <p class="space-x-1 text-xs text-zinc-400">
          <span>Conversion Rate:</span>
          <span class="text-white">1,452 USD</span>
        </p>
      </div>
      <div class="flex divide-x space-x-1 p-2 sm:p-1 bg-gradient rounded-lg">
        <input
          id="amount"
          type="text"
          class="p-2 text-base sm:text-sm bg-gradient w-full rounded-lg border-none outline-none"
          placeholder="0.5"
          @input="(evt) => onCustomGasPriceInput(evt.target.value)"
        />
        <div
          v-if="rpcStore.currency"
          class="p-2"
          :class="{ 'border-l-[1px] px-1': rpcStore.currency }"
        >
          <p>{{ rpcStore.currency }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
