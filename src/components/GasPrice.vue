<script setup lang="ts">
import { type Ref, ref, watch } from 'vue'

import { useRpcStore } from '@/store/rpc'

const emits = defineEmits(['gasPriceInput'])

const props = defineProps({
  gasPrices: {
    type: Object,
    required: false,
    default: () => ({}),
  },
  baseFee: {
    type: String,
    default: '0',
  },
  gasLimit: {
    type: String,
    default: '0',
  },
})

const rpcStore = useRpcStore()

const maxFeePerGas = ref(0)
const maxPriorityFeePerGas = ref(0)
const totalGasUsed = ref(Number(props.gasLimit))
const transactionTime = ref(null)
const selectedGasMethod: Ref<'normal' | 'fast' | 'custom'> = ref('normal')

watch(selectedGasMethod, () => {
  handleGasPriceSelect(selectedGasMethod.value)
})

emits('gasPriceInput', {
  maxFeePerGas: Number(props.baseFee),
  maxPriorityFeePerGas: 4,
  gasLimit: totalGasUsed.value,
})

function handleGasPriceSelect(gasMethod: 'normal' | 'fast' | 'custom') {
  if (gasMethod === 'normal' || gasMethod === 'custom') {
    maxPriorityFeePerGas.value = 4
    maxFeePerGas.value = Number(props.baseFee)
  } else if (gasMethod === 'fast') {
    maxPriorityFeePerGas.value = 10
    maxFeePerGas.value = Number(props.baseFee) * 2
  }
  emits('gasPriceInput', {
    maxFeePerGas: maxFeePerGas.value,
    maxPriorityFeePerGas: maxPriorityFeePerGas.value,
    gasLimit: totalGasUsed.value,
  })
}

function handleCustomGasPriceInput() {
  const amountInputEl = document.querySelector(
    '#custom-gas-fee-amount'
  ) as HTMLInputElement
  if (!maxFeePerGas.value && maxFeePerGas.value !== 0) {
    amountInputEl.setCustomValidity('Enter the gas fees to continue.')
  } else if (maxFeePerGas.value < Number(props.baseFee)) {
    amountInputEl.setCustomValidity('Gas fees must not be less than base fees.')
  } else {
    amountInputEl.setCustomValidity('')
    emits('gasPriceInput', {
      maxFeePerGas: maxFeePerGas.value,
      maxPriorityFeePerGas: maxPriorityFeePerGas.value,
      gasLimit: totalGasUsed.value,
    })
  }
  emits('gasPriceInput', {
    maxFeePerGas: maxFeePerGas.value,
    maxPriorityFeePerGas: maxPriorityFeePerGas.value,
    gasLimit: totalGasUsed.value,
  })
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <div class="flex justify-between items-baseline">
      <span class="text-sm font-medium">Gas Fees</span>
      <div v-if="false" class="text-xs font-normal">
        <span class="text-gray-100">Transaction Time:</span>
        <span class="text-black-500 dark:text-white-100">
          ~{{ transactionTime }} mins
        </span>
      </div>
    </div>
    <div class="card flex p-1">
      <div
        class="p-1 w-full text-center text-base font-normal cursor-pointer rounded-sm hover:bg-black-500 dark:hover:bg-black-300 focus-visible:bg-black-500 dark:focus-visible:bg-black-300 select-none"
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
        class="p-1 w-full text-center text-base font-normal cursor-pointer rounded-sm hover:bg-black-500 dark:hover:bg-black-300 focus-visible:bg-black-500 dark:focus-visible:bg-black-300 select-none"
        :class="{
          'bg-black-500 dark:bg-black-300 text-white-100':
            selectedGasMethod === 'fast',
          'text-gray-100': selectedGasMethod !== 'fast',
        }"
        @click.stop="selectedGasMethod = 'fast'"
      >
        Fast
      </div>
      <div
        class="p-1 w-full text-center text-base font-normal cursor-pointer rounded-sm hover:bg-black-500 dark:hover:bg-black-300 focus-visible:bg-black-500 dark:focus-visible:bg-black-300 select-none"
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
  <div v-if="selectedGasMethod === 'custom'" class="flex flex-col gap-4">
    <div class="flex flex-col gap-1">
      <label class="text-sm font-medium" for="gasLimit"> Gas Limit </label>
      <input
        id="gasLimit"
        v-model="totalGasUsed"
        required
        type="text"
        class="input-field"
        placeholder="Enter total gas to be used"
      />
    </div>
    <div class="flex flex-col gap-1">
      <label class="text-sm font-medium" for="maxFee">
        Max Priority Fee (Gwei)
      </label>
      <input
        id="maxFee"
        v-model="maxPriorityFeePerGas"
        required
        type="text"
        class="input-field"
        placeholder="Enter Max priority fee per gas"
      />
    </div>
    <div class="flex flex-col gap-1">
      <label class="text-sm font-medium" for="maxPriorityFee">
        Max Fee (Gwei)
      </label>
      <input
        id="maxPriorityFee"
        v-model="maxFeePerGas"
        required
        type="text"
        class="input-field"
        placeholder="Enter Max fee per gas"
        @input="handleCustomGasPriceInput()"
      />
      <div class="flex justify-end gap-1">
        <span class="text-xs text-gray-100">Base Fee:</span>
        <span class="text-xs">{{ props.baseFee }} Gwei</span>
      </div>
    </div>
  </div>
</template>
