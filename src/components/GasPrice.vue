<script setup lang="ts">
import { Decimal } from 'decimal.js'
import { type Ref, ref, watch, computed } from 'vue'

const emits = defineEmits(['gasPriceInput'])

type GasPriceProps = {
  baseFee: string | number
  gasLimit: string | number
  maxFeePerGas?: string | number
  maxPriorityFeePerGas?: string | number
}

const props = defineProps<GasPriceProps>()

const computedProps = computed(() => {
  return {
    baseFee: props.baseFee,
    gasLimit: props.gasLimit,
    maxFeePerGas: props.maxFeePerGas,
    maxPriorityFeePerGas: props.maxPriorityFeePerGas,
  }
})

const maxFeePerGas = ref(null as number | null)
const maxPriorityFeePerGas = ref(null as number | null)
const totalGasUsed = ref(Number(props.gasLimit) as number | null)
const transactionTime = ref(null)
const selectedGasMethod: Ref<'normal' | 'fast' | 'custom'> = ref('normal')

const sanitizedBaseFee = computed(() => {
  return new Decimal(computedProps.value.baseFee).toFixed(9)
})

watch(selectedGasMethod, () => {
  handleGasPriceSelect(selectedGasMethod.value)
})

if (computedProps.value.maxPriorityFeePerGas) {
  maxPriorityFeePerGas.value = new Decimal(
    computedProps.value.maxPriorityFeePerGas
  ).toNumber()
} else {
  maxPriorityFeePerGas.value = new Decimal(sanitizedBaseFee.value)
    .div(10)
    .toDecimalPlaces(2)
    .toNumber()
}

if (computedProps.value.maxFeePerGas) {
  maxFeePerGas.value = new Decimal(computedProps.value.maxFeePerGas)
    .add(maxPriorityFeePerGas.value)
    .toNumber()
} else {
  maxFeePerGas.value = new Decimal(sanitizedBaseFee.value)
    .mul(1.25)
    .add(maxPriorityFeePerGas.value)
    .toNumber()
}

emits('gasPriceInput', {
  maxFeePerGas: maxFeePerGas.value,
  maxPriorityFeePerGas: maxPriorityFeePerGas.value,
  gasLimit: totalGasUsed.value,
})

function handleGasPriceSelect(gasMethod: 'normal' | 'fast' | 'custom') {
  if (gasMethod === 'normal') {
    maxPriorityFeePerGas.value = new Decimal(sanitizedBaseFee.value)
      .div(100)
      .toDecimalPlaces(2)
      .toNumber()
    maxFeePerGas.value = new Decimal(sanitizedBaseFee.value)
      .add(maxPriorityFeePerGas.value)
      .toNumber()
  } else if (gasMethod === 'fast') {
    maxPriorityFeePerGas.value = new Decimal(sanitizedBaseFee.value)
      .div(50)
      .toDecimalPlaces(2)
      .toNumber()
    maxFeePerGas.value = new Decimal(sanitizedBaseFee.value)
      .add(maxPriorityFeePerGas.value)
      .toNumber()
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
      <span class="text-sm font-normal text-[#8D8D8D]">Gas Fees</span>
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
  <div v-if="selectedGasMethod === 'custom'" class="flex flex-col gap-4 mt-4">
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
        <span class="text-xs">{{ sanitizedBaseFee }} Gwei</span>
      </div>
    </div>
  </div>
</template>
