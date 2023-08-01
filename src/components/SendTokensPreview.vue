<script setup lang="ts">
import { Decimal } from 'decimal.js'

import SwipeToAction from '@/components/SwipeToAction.vue'
import { PreviewData } from '@/models/SendTokenPreview'
import { useRpcStore } from '@/store/rpc'
import { getImage } from '@/utils/getImage'

const rpcStore = useRpcStore()

const emits = defineEmits(['close', 'submit'])
const props = defineProps({
  previewData: {
    type: PreviewData,
    required: true,
  },
})

const nativeCurrency = rpcStore.nativeCurrency?.symbol

const txFees = new Decimal(props.previewData.gasFee)
  .mul(props.previewData.estimatedGas)
  .toString()

function truncateAddress(address: string) {
  return `${address.slice(0, 5)}....${address.slice(-5)}`
}
</script>

<template>
  <div class="flex flex-col justify-between">
    <div class="flex flex-col gap-7">
      <div class="relative flex justify-center items-center">
        <button
          class="absolute left-0"
          title="Click to go back"
          @click.stop="emits('close')"
        >
          <img :src="getImage('back-arrow.svg')" class="w-6 h-6" />
        </button>
        <span class="text-lg font-bold">Confirm Transfer</span>
      </div>
      <div class="flex justify-between items-center">
        <div class="flex flex-col gap-1">
          <span class="text-sm font-medium text-gray-100"
            >Sender’s Address</span
          >
          <span class="text-base">
            {{ truncateAddress(props.previewData.senderWalletAddress) }}
          </span>
        </div>
        <img :src="getImage('forward-arrow.svg')" class="w-6 h-6" />
        <div class="flex flex-col gap-1">
          <span class="text-sm font-medium text-gray-100"
            >Recipient’s Address</span
          >
          <span class="text-base">
            {{ truncateAddress(props.previewData.recipientWalletAddress) }}
          </span>
        </div>
      </div>
      <div class="flex flex-col gap-5">
        <div class="flex justify-between">
          <span class="text-base font-normal text-gray-100">Send Amount</span>
          <span class="text-base"
            >{{ props.previewData.amount }}
            {{ props.previewData.selectedToken }}</span
          >
        </div>
        <div class="flex justify-between">
          <span class="text-base font-normal text-gray-100">Gas Fees</span>
          <span class="text-base">{{ txFees }} {{ nativeCurrency }}</span>
        </div>
      </div>
    </div>
    <SwipeToAction @approve="emits('submit')" @reject="emits('close')" />
  </div>
</template>
