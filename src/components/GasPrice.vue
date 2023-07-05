<script setup lang="ts">
import { type Ref, ref, watch, computed } from 'vue'

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

const maxFeePerGas = ref(0 as number | null)
const maxPriorityFeePerGas = ref(0 as number | null)
const totalGasUsed = ref(Number(props.gasLimit) as number | null)
const transactionTime = ref(null)
const selectedGasMethod: Ref<'normal' | 'fast' | 'custom'> = ref('normal')

const sanitizedBaseFee = computed(() => {
  return Number(props.baseFee).toFixed(9)
})

watch(selectedGasMethod, () => {
  handleGasPriceSelect(selectedGasMethod.value)
})

emits('gasPriceInput', {
  maxFeePerGas: null,
  maxPriorityFeePerGas: null,
  gasLimit: null,
})

function handleGasPriceSelect(gasMethod: 'normal' | 'fast' | 'custom') {
  if (gasMethod === 'normal' || gasMethod === 'custom') {
    maxPriorityFeePerGas.value = null
    maxFeePerGas.value = null
    totalGasUsed.value = null
  } else if (gasMethod === 'fast') {
    maxPriorityFeePerGas.value = Math.round(Number(sanitizedBaseFee.value))
    maxFeePerGas.value = Number(sanitizedBaseFee.value) * 2
    totalGasUsed.value = null
  }
  emits('gasPriceInput', {
    maxFeePerGas: maxFeePerGas.value,
    maxPriorityFeePerGas: maxPriorityFeePerGas.value,
    gasLimit: totalGasUsed.value,
  })
}

function handleCustomGasPriceInput() {
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
        @input="handleCustomGasPriceInput()"
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
        @input="handleCustomGasPriceInput()"
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
        <span class="text-xs">{{ Number(sanitizedBaseFee) }} Gwei</span>
      </div>
    </div>
  </div>
</template>
