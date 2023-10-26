<script setup lang="ts">
import { Decimal } from 'decimal.js'

import SignMessageAdvancedInfo from '@/components/signMessageAdvancedInfo.vue'
import { truncateMid } from '@/utils/stringUtils'

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  chainConfig: {
    type: Object,
    required: true,
  },
})

function calculateValue(value) {
  return `${new Decimal(value).div(Decimal.pow(10, 18)).toString()} ${
    props.chainConfig.currency || 'Units'
  }`
}

function getGasValue(gasPrice) {
  return `${new Decimal(gasPrice).add(1.5).mul(21000).toHexadecimal()}`
}

function calculateGasPrice(gasPrice) {
  if (gasPrice !== undefined) {
    return `${new Decimal(getGasValue(gasPrice))
      .div(Decimal.pow(10, 18))
      .toDecimalPlaces(10)
      .toString()} ${props.chainConfig.currency || 'Units'}`
  }
  return 'Unknown'
}
</script>

<template>
  <div
    class="flex-1 flex flex-col bg-[#141414] p-4 h-full rounded-md space-y-4 border-2 overflow-auto"
  >
    <p class="text-sm font-medium">Transaction Details</p>
    <div v-if="data.params[0]?.to" class="flex justify-between">
      <span class="text-sm">To</span>
      <span class="text-sm">{{ truncateMid(data.params[0]?.to) }}</span>
    </div>
    <div class="flex justify-between">
      <span class="text-sm">Gas Price</span>
      <span class="text-sm">{{
        calculateGasPrice(data.params[0].gas || data.params[0].gasPrice)
      }}</span>
    </div>
    <div v-if="data.params[0]?.value" class="flex justify-between">
      <span class="text-sm">Value</span>
      <span class="text-sm">{{ calculateValue(data.params[0]?.value) }}</span>
    </div>
    <div v-if="data.params[0]?.data" class="flex flex-col space-y-2 flex-1">
      <span class="text-sm">Data</span>
      <SignMessageAdvancedInfo :info="data.params[0]?.data" />
    </div>
  </div>
</template>
