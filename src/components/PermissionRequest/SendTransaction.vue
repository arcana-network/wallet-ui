<script setup lang="ts">
import { Decimal } from 'decimal.js'

import SignMessageAdvancedInfo from '@/components/signMessageAdvancedInfo.vue'
import { truncateMid } from '@/utils/stringUtils'

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
})

console.log(props.data, 'data-data')

function calculateValue(value) {
  // return `${new Decimal(value).div(Decimal.pow(10, 18)).toString()} ${
  //   rpcStore.selectedRPCConfig?.nativeCurrency?.symbol || 'Units'
  // }`

  return `${new Decimal(value).div(Decimal.pow(10, 18)).toString()} ${'Units'}`
}

function getGasValue(gasPrice) {
  return `${new Decimal(gasPrice).add(1.5).mul(21000).toHexadecimal()}`
}

function calculateGasPrice(gasPrice) {
  if (gasPrice) {
    return `${new Decimal(getGasValue(gasPrice))
      .div(Decimal.pow(10, 18))
      .toDecimalPlaces(10)
      .toString()} ${
      // rpcStore.selectedRPCConfig?.nativeCurrency?.symbol || 'Units'
      'Units'
    }`
  }
  return 'Unknown'
}
</script>

<template>
  <div class="flex-1 bg-[#141414] p-4 h-full rounded-md space-y-4">
    <div v-if="data.params[0].to" class="flex justify-between gap-4">
      <span class="w-[120px]">To</span>
      <span>{{ truncateMid(data.params[0]?.to) }}</span>
    </div>
    <div class="flex justify-between gap-4">
      <span class="w-[120px]">Gas Price</span>
      <span>{{
        calculateGasPrice(data.params[0]?.gasPrice || data.params[0]?.gas)
      }}</span>
    </div>
    <div v-if="data.params[0]?.value" class="flex justify-between gap-4">
      <span class="w-[120px]">Value</span>
      <span>{{ calculateValue(data.params[0]?.value) }}</span>
    </div>
    <div v-if="data.params[0]?.data" class="flex flex-col gap-1">
      <span class="w-[120px]">Data</span>
      <SignMessageAdvancedInfo :info="data.params[0]?.data" />
    </div>
  </div>
</template>
