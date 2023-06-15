<script setup lang="ts">
import { type Ref, ref, watch } from 'vue'

import { GAS_AVAILABLE_CHAIN_IDS } from '@/services/gasPrice.service'
import { useRpcStore } from '@/store/rpc'

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
const isGasPriceFocused = ref(false)
const selectedGasMethod: Ref<'normal' | 'fast' | 'custom'> = ref('normal')

const hasGasStation = GAS_AVAILABLE_CHAIN_IDS.includes(
  Number(rpcStore.selectedChainId)
)

watch(
  () => selectedGasMethod,
  () => {
    handleGasPriceSelect(selectedGasMethod.value)
  }
)

function handleGasPriceSelect(gasMethod: 'normal' | 'fast' | 'custom') {
  if (gasMethod === 'normal' || gasMethod === 'custom') {
    gasFee.value = Number(props.baseFee)
  } else if (gasMethod === 'fast') {
    gasFee.value = Number(props.baseFee) * 3
  }
  emits('gasPriceInput', gasFee.value)
}

function handleCustomGasPriceInput() {
  const amountInputEl = document.querySelector(
    '#custom-gas-fee-amount'
  ) as HTMLInputElement
  if (!gasFee.value && gasFee.value !== 0) {
    amountInputEl.setCustomValidity('Enter the gas fees to continue.')
  } else if (gasFee.value < Number(props.baseFee)) {
    amountInputEl.setCustomValidity('Gas fees must not be less than base fees.')
  } else {
    amountInputEl.setCustomValidity('')
    emits('gasPriceInput', gasFee.value)
  }
  emits('gasPriceInput', gasFee.value)
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <div class="flex justify-between items-baseline">
      <span class="text-sm font-medium">Gas Fees</span>
      <div v-if="false" class="text-xs font-normal">
        <span class="text-gray-100">Transaction Time:</span>
        <span class="text-black-500 dark:text-white-100">
          ~{{ hasGasStation ? '-' : transactionTime }} mins
        </span>
      </div>
    </div>
    <div class="card flex p-1">
      <!-- <div
        class="p-1 w-full text-center text-base font-normal cursor-pointer rounded-sm hover:bg-black-500 dark:hover:bg-black-300 focus-visible:bg-black-500 dark:focus-visible:bg-black-300 select-none"
        :class="{
          'bg-black-500 dark:bg-black-300 text-white-100':
            selectedGasMethod === 'custom',
          'text-gray-100': selectedGasMethod !== 'custom',
        }"
        @click.stop="selectedGasMethod = 'custom'"
      >
        Custom
      </div> -->
    </div>
  </div>
  <div v-if="selectedGasMethod === 'custom'" class="flex flex-col gap-1">
    <label class="text-sm font-medium" for="quantity"> Set Custom Fee </label>
    <input
      id="quantity"
      v-model="gasFee"
      required
      type="text"
      class="input-field"
      :class="{ 'input-active': isGasPriceFocused }"
      placeholder="Enter Recipient’s Wallet Address"
      @focus="isGasPriceFocused = true"
      @blur="isGasPriceFocused = false"
      @input="handleCustomGasPriceInput()"
    />
    <div class="flex justify-end gap-1">
      <span class="text-xs text-gray-100">Base Fee:</span>
      <span class="text-xs">{{ props.baseFee }} Gwei</span>
    </div>
  </div>
</template>
