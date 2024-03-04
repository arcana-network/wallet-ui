<script setup lang="ts">
import { Decimal } from 'decimal.js'
import { onBeforeMount, ref, onMounted } from 'vue'

import SwipeToAction from '@/components/SwipeToAction.vue'
import { useAppStore } from '@/store/app'
import { useRpcStore } from '@/store/rpc'
import { ChainType } from '@/utils/chainType'
import { getImage } from '@/utils/getImage'
import { scwInstance } from '@/utils/scw'

const rpcStore = useRpcStore()
const appStore = useAppStore()

const loader = ref({
  show: false,
  message: '',
})
const txFees = ref('0')

const paymasterBalance = ref(0)
onBeforeMount(async () => {
  loader.value.show = true
  if (appStore.chainType === ChainType.evm_secp256k1 && rpcStore.useGasless) {
    paymasterBalance.value = (await scwInstance.getPaymasterBalance()) / 1e18
  }
  loader.value.show = false
})

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

onMounted(() => {
  if (appStore.chainType === ChainType.evm_secp256k1) {
    txFees.value = new Decimal(props.previewData.gasFee)
      .mul(props.previewData.estimatedGas)
      .toString()
  } else if (appStore.chainType === ChainType.multiversx_cv25519) {
    txFees.value = props.previewData.estimatedGas
  }
})

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
      <span
        v-if="rpcStore.useGasless && paymasterBalance >= 0.1"
        class="text-xs text-green-100 font-medium text-center w-full"
        >This is a Gasless Transaction. Click Below to Approve.
      </span>
    </div>
    <SwipeToAction @approve="emits('submit')" @reject="emits('close')" />
  </div>
</template>
