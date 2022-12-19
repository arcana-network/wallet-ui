<script setup lang="ts">
import { useRpcStore } from '@/store/rpc'
import { useImage } from '@/utils/useImage'

const getImage = useImage()
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

const nativeCurrency = rpcStore.nativeCurrency.symbol

const txFees =
  Number(props.previewData.gasFee) * Number(props.previewData.estimatedGas)
</script>

<template>
  <div class="space-y-4 overflow-auto flex flex-col">
    <div class="flex flex-col space-y-3 sm:space-y-2">
      <p class="text-xl sm:text-sm font-semibold">Preview</p>
    </div>
    <div class="w-full aspect-square rounded-[10px]">
      <img
        :src="props.previewData.imageUrl"
        class="object-cover object-center"
      />
    </div>
    <div class="space-y-1">
      <p class="text-xs text-zinc-400">Network</p>
      <p class="text-base sm:text-sm">
        {{ rpcStore.selectedRpcConfig?.chainName }}
      </p>
    </div>
    <div class="space-y-1">
      <p class="text-xs text-zinc-400 font-semibold">Sender’s Wallet Address</p>
      <p
        class="text-base truncate"
        :title="props.previewData.senderWalletAddress"
      >
        {{ props.previewData.senderWalletAddress }}
      </p>
    </div>
    <div class="flex justify-center">
      <img :src="getImage('arrow-down-icon')" alt="arrow down icon" />
    </div>
    <div class="space-y-1">
      <p class="text-xs text-zinc-400 font-semibold">
        Recipient’s Wallet Address
      </p>
      <p
        class="text-sm truncate"
        :title="props.previewData.recipientWalletAddress"
      >
        {{ props.previewData.recipientWalletAddress }}
      </p>
    </div>
    <div class="space-y-3">
      <div class="space-y-[10px]">
        <div
          class="flex flex-col text-sm sm:text-xs font-normal flex-nowrap gap-1"
        >
          <p class="text-xs text-zinc-400 font-semibold">Gas Fees</p>
          <p
            :title="`${txFees} ${nativeCurrency}`"
            class="overflow-hidden text-ellipsis whitespace-nowrap"
          >
            {{ txFees }} {{ nativeCurrency }}
          </p>
        </div>
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
