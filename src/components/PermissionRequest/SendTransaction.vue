<script setup lang="ts">
import { Decimal } from 'decimal.js'
import { ref } from 'vue'

import SignMessageAdvancedInfo from '@/components/signMessageAdvancedInfo.vue'
import { getImage } from '@/utils/getImage'

const props = defineProps({
  request: {
    type: Object,
    required: true,
  },
  chainConfig: {
    type: Object,
    required: true,
  },
  appDetails: {
    type: Object,
    required: true,
  },
})

const showDetails = ref(false)

function calculateValue(value) {
  return `${new Decimal(value).div(Decimal.pow(10, 18)).toString()}`
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
    class="flex-1 flex flex-col p-2 h-full rounded-md space-y-4 overflow-auto"
  >
    <p class="text-sm text-[#8D8D8D] font-medium text-center">
      The application
      <span class="text-white-300">{{ appDetails?.name }}</span> is requesting a
      payment. Do you approve the transaction?
    </p>
    <div
      v-if="request.params[0]?.value"
      class="flex justify-center items-baseline space-x-5"
    >
      <span class="text-sm">{{ props.chainConfig.currency || 'Units' }}</span>
      <span class="text-4xl text-white-400">{{
        calculateValue(request.params[0]?.value)
      }}</span>
    </div>
    <div class="text-center">
      <span class="text-sm text-[#8D8D8D]">
        Additional
        <span class="text-white-400">{{
          calculateGasPrice(request.params[0].gas || request.params[0].gasPrice)
        }}</span>
        for Transaction Fees
      </span>
    </div>
    <div
      v-if="request.params[0]?.data"
      class="flex flex-col space-y-2 flex-1 h-2/4"
    >
      <button
        class="flex justify-center items-center text-sm font-bold"
        @click="showDetails = !showDetails"
      >
        <span>View Details </span>
        <img
          :src="getImage('arrow-down.svg')"
          class="transition-all duration-500 ease-in-out"
          :class="{ '-rotate-180': showDetails }"
          title="Click to expand"
        />
      </button>
      <SignMessageAdvancedInfo
        v-if="showDetails"
        :info="request.params[0]?.data"
      />
    </div>
  </div>
</template>
