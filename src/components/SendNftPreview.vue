<script setup lang="ts">
import { Decimal } from 'decimal.js'

import SwipeToAction from '@/components/SwipeToAction.vue'
import { useRpcStore } from '@/store/rpc'
import { getImage } from '@/utils/getImage'

const rpcStore = useRpcStore()

type NftPreviewProps = {
  previewData: {
    senderWalletAddress: string
    recipientWalletAddress: string
    gasFee: string
    estimatedGas: string
    nftContractAddress: string
    tokenId: string
    imageUrl: string
    quantity?: number
  }
}

const emits = defineEmits(['close', 'submit'])
const props = defineProps<NftPreviewProps>()

const nativeCurrency = rpcStore.nativeCurrency?.symbol

const txFees = new Decimal(props.previewData.gasFee)
  .mul(props.previewData.estimatedGas)
  .toString()

function truncateAddress(address: string) {
  return `${address.slice(0, 5)}....${address.slice(-5)}`
}
</script>

<template>
  <div class="flex flex-col flex-grow justify-between">
    <div class="flex flex-col flex-grow gap-7">
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
      <div
        v-if="props.previewData?.imageUrl"
        class="mx-auto w-16 aspect-square rounded-[10px] overflow-hidden"
      >
        <img
          :src="props.previewData.imageUrl"
          class="object-cover object-center w-full h-full"
        />
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
      <div class="flex flex-col gap-1">
        <div class="flex justify-between">
          <span class="text-base font-normal text-gray-100">Quantity</span>
          <span class="text-base">{{ props.previewData.quantity || 1 }}</span>
        </div>
        <div v-if="Number(txFees)" class="flex justify-between">
          <span class="text-base font-normal text-gray-100">Gas Fee</span>
          <span class="text-base">{{ txFees }} {{ nativeCurrency }}</span>
        </div>
      </div>
    </div>
    <SwipeToAction @approve="emits('submit')" @reject="emits('close')" />
  </div>
</template>
