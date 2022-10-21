<script setup lang="ts">
import BigNumber from 'bignumber.js'

import { PreviewData } from '@/models/SendTokenPreview'
import { useRpcStore } from '@/store/rpc'
import { useImage } from '@/utils/useImage'

const getImage = useImage()
const rpcStore = useRpcStore()

const emits = defineEmits(['close', 'submit'])
const props = defineProps({
  previewData: {
    type: PreviewData,
    required: true,
  },
})

const nativeCurrency = rpcStore.nativeCurrency.symbol

const txFees =
  Number(props.previewData.gasFee) * Number(props.previewData.estimatedGas)

const sendAmount =
  nativeCurrency === props.previewData.selectedToken
    ? Number(props.previewData.amount)
    : 0

const totalAmount = sendAmount + txFees
</script>

<template>
  <div class="space-y-3 overflow-auto flex flex-col">
    <div class="flex flex-col space-y-3 sm:space-y-2">
      <p class="text-xl sm:text-sm">Preview</p>
    </div>
    <div class="space-y-1">
      <p class="text-xs text-zinc-400">Network</p>
      <p class="text-base sm:text-sm">
        {{ rpcStore.selectedRpcConfig?.chainName }}
      </p>
    </div>
    <div class="space-y-1">
      <p class="text-xs text-zinc-400">Sender’s Wallet Address</p>
      <p class="text-base truncate">
        {{ props.previewData.senderWalletAddress }}
      </p>
    </div>
    <div class="flex justify-center">
      <img :src="getImage('arrow-down-icon')" alt="arrow down icon" />
    </div>
    <div class="space-y-1">
      <p class="text-xs text-zinc-400">Recipient’s Wallet Address</p>
      <p class="text-sm truncate">
        {{ props.previewData.recipientWalletAddress }}
      </p>
    </div>
    <div class="space-y-3">
      <div class="flex justify-between text-xs text-zinc-400">
        <p>Items</p>
        <p>Amount</p>
      </div>
      <div class="space-y-[10px]">
        <div class="flex justify-between text-sm sm:text-xs font-normal">
          <p>Send Amount</p>
          <p>
            {{ props.previewData.amount }}
            {{ props.previewData.selectedToken }}
          </p>
        </div>
        <div class="flex justify-between text-sm sm:text-xs font-normal">
          <p>Gas Fees</p>
          <p>{{ txFees }} {{ nativeCurrency }}</p>
        </div>
      </div>
      <div
        class="flex justify-between text-sm sm:text-xs font-normal border-y-[1px] border-x-0 border-zinc-400 py-4"
      >
        <p>Total:</p>
        <p>
          {{ new BigNumber(totalAmount).toFixed() }}
          {{ nativeCurrency }}
        </p>
      </div>
    </div>
    <div class="flex justify-between">
      <button
        class="text-sm sm:text-xs rounded-xl border-2 border-black dark:border-white bg-transparent text-black dark:text-white w-36 h-9 sm:w-20 sm:h-8 uppercase"
        @click="emits('close')"
      >
        Back
      </button>
      <button
        class="text-sm sm:text-xs rounded-xl text-white dark:bg-white bg-black dark:text-black w-36 h-9 sm:w-20 sm:h-8 uppercase"
        @click="emits('submit')"
      >
        Send
      </button>
    </div>
  </div>
</template>
