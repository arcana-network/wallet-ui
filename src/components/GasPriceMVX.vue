<script setup lang="ts">
import { computed } from 'vue'

import { useRpcStore } from '@/store/rpc'

const emits = defineEmits(['gasLimitInput'])

const rpcStore = useRpcStore()

const props = defineProps<{
  gasFee: number | string
  gasPrice: number | string
  gasLimit: number | string
  minGasLimit: number | string
}>()

function onGasLimitChange(event: Event) {
  const target = event.target as HTMLInputElement
  const value = target.value
  emits('gasLimitInput', value)
}

const gasLimit = computed(() => props.gasLimit)
</script>

<template>
  <div class="space-y-2">
    <div class="flex flex-col gap-1">
      <span class="text-sm font-medium">Gas Fee</span>
      <span class="text-sm font-medium"
        >{{ props.gasFee }} {{ rpcStore.nativeCurrency?.symbol }}</span
      >
    </div>
    <div class="flex flex-col gap-1">
      <span class="text-sm font-medium">Gas Price</span>
      <span class="text-sm font-medium">{{ props.gasPrice }}</span>
    </div>
    <div class="flex flex-col gap-1">
      <div class="text-sm font-medium flex justify-between">
        <label for="gas-limit">Gas Limit</label>
        <p>Min Gas Limit: {{ minGasLimit }}</p>
      </div>
      <div class="flex justify-between space-x-2">
        <input
          id="gas-limit"
          :value="gasLimit"
          type="number"
          class="input-field flex-1"
          @input="onGasLimitChange"
        />
      </div>
    </div>
  </div>
</template>
