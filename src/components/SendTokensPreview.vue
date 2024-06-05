<script setup lang="ts">
import { Decimal } from 'decimal.js'
import { onBeforeMount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import SwipeToAction from '@/components/SwipeToAction.vue'
import { PreviewData } from '@/models/SendTokenPreview'
import { useAppStore } from '@/store/app'
import { useRpcStore } from '@/store/rpc'
import { EVMAccountHandler } from '@/utils/accountHandler'
import { ChainType } from '@/utils/chainType'
import { getImage } from '@/utils/getImage'
import { getRequestHandler } from '@/utils/requestHandlerSingleton'

const rpcStore = useRpcStore()
const appStore = useAppStore()
const route = useRoute()
const isPermissionRequestPage = route.name === 'PermissionRequest'
const txFees = ref('0')
const requestHandler = getRequestHandler()

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

const paymasterBalance = ref('0')
const transactionMode = ref('')

onBeforeMount(async () => {
  loader.value.show = true
  if (appStore.chainType === ChainType.evm_secp256k1 && rpcStore.useGasless) {
    const accountHandler =
      requestHandler.getAccountHandler() as EVMAccountHandler
    const result =
      await accountHandler.determineTransactionModeAndPaymasterBalance()
    paymasterBalance.value = new Decimal(result.paymasterBalance.toHexString())
      .div(Decimal.pow(10, accountHandler.decimals))
      .toString()
    transactionMode.value = result.transactionMode
  }
  loader.value.show = false
})

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
              !loader.show &&
              (transactionMode === 'SCW' || transactionMode === 'ARCANA')
            "
            class="text-base text-green-100"
          >
            Sponsored
          </span>
          <span
            v-else-if="
              !loader.show &&
              (transactionMode.length === 0 || !rpcStore.useGasless)
            "
            class="text-base"
            >{{ txFees }} {{ nativeCurrency }}</span
          >
        </div>
      </div>
      <span
        v-if="
          !loader.show &&
          (transactionMode === 'SCW' || transactionMode === 'ARCANA')
        "
        class="text-xs text-green-100 font-medium text-center w-full"
        >This is a Gasless Transaction. Click Below to Approve.
      </span>
      <span
        v-else-if="
          !loader.show && transactionMode.length === 0 && rpcStore.useGasless
        "
        class="text-xs text-center"
      >
        Limit exceeded for gasless transactions. You will be charged for this
        transaction.
      </span>
    </div>
    <SwipeToAction
      v-if="!isPermissionRequestPage"
      @approve="emits('submit')"
      @reject="emits('close')"
    />
  </div>
</template>
