<script setup lang="ts">
import { Decimal } from 'decimal.js'
import { onBeforeMount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'

import SwipeToAction from '@/components/SwipeToAction.vue'
import { PreviewData } from '@/models/SendTokenPreview'
import { useAppStore } from '@/store/app'
import { useRpcStore } from '@/store/rpc'
import { ChainType } from '@/utils/chainType'
import { getImage } from '@/utils/getImage'
import { scwInstance } from '@/utils/scw'

const rpcStore = useRpcStore()
const appStore = useAppStore()
const route = useRoute()
const toast = useToast()
const isPermissionRequestPage = route.name === 'PermissionRequest'

const emits = defineEmits(['close', 'submit'])
const props = defineProps({
  previewData: {
    type: PreviewData,
    required: true,
  },
})

const loader = ref({
  show: false,
  message: '',
})

const paymasterBalance = ref(0)
onBeforeMount(async () => {
  loader.value.show = true
  paymasterBalance.value = (await scwInstance.getPaymasterBalance()) / 1e18
  loader.value.show = false
})

const nativeCurrency = rpcStore.nativeCurrency?.symbol

const txFees =
  appStore.chainType === ChainType.evm_secp256k1
    ? new Decimal(props.previewData.gasFee)
        .mul(props.previewData.estimatedGas)
        .toString()
    : undefined

function truncateAddress(address: string) {
  return `${address.slice(0, 5)}....${address.slice(-5)}`
}
</script>

<template>
  <div class="flex flex-col justify-between">
    <div class="flex flex-col gap-7">
      <div
        v-if="!isPermissionRequestPage"
        class="relative flex justify-center items-center"
      >
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
        <div v-if="txFees" class="flex justify-between">
          <span class="text-base font-normal text-gray-100">Gas Fees</span>
          <span v-if="loader.show" class="text-base"> Loading... </span>
          <span
            v-else-if="
              !loader.show && rpcStore.useGasless && paymasterBalance < 0.1
            "
            class="text-base"
          >
            {{ txFees }} {{ nativeCurrency }}
          </span>
          <span
            v-else-if="
              !loader.show && rpcStore.useGasless && paymasterBalance >= 0.1
            "
            class="text-base text-green-100"
          >
            Sponsored
          </span>
          <span
            v-else-if="!loader.show && !rpcStore.useGasless"
            class="text-base"
            >{{ txFees }} {{ nativeCurrency }}</span
          >
        </div>
      </div>
      <span
        v-if="!loader.show && rpcStore.useGasless && paymasterBalance > 0.1"
        class="text-xs text-green-100 font-medium text-center w-full"
        >This is a Gasless Transaction. Click Below to Approve.
      </span>
    </div>
    <SwipeToAction
      v-if="!isPermissionRequestPage"
      @approve="emits('submit')"
      @reject="emits('close')"
    />
  </div>
</template>
