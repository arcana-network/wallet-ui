<script setup lang="ts">
import { onMounted, ref } from 'vue'

import DateTime from '@/components/DateTime.vue'
import { useAppStore } from '@/store/app'
import { useParentConnectionStore } from '@/store/parentConnection'
import { useRpcStore } from '@/store/rpc'
import { GAS_FEE_UNIT, GAS_PRICE_SPEED_MAP } from '@/utils/constants'

const emits = defineEmits(['reject', 'approve'])

const rpcStore = useRpcStore()
const appStore = useAppStore()
const parentConnectionStore = useParentConnectionStore()
const gasFee = ref(0)
const transactionTime = ref(null)

const props = defineProps({
  request: {
    type: Object,
    required: true,
  },
  gasPrices: {
    type: Object,
    required: false,
    default: () => ({}),
  },
})

onMounted(async () => {
  setHeight()
  getGasPriceInfo()
})

async function setHeight() {
  const parentConnectionInstance = await parentConnectionStore.parentConnection
    ?.promise
  await parentConnectionInstance?.setIframeStyle({
    ...appStore.iframeStyle,
    height: '275px',
  })
}

function getGasPriceInfo() {
  const { wait, price } = GAS_PRICE_SPEED_MAP['slow']
  gasFee.value = Number((props.gasPrices[price] / 10).toFixed(9))
  transactionTime.value = props.gasPrices[wait]
}
</script>

<template>
  <div
    class="flex flex-1 flex-col h-full space-y-2 rounded-b-xl justify-between"
  >
    <div class="flex items-baseline">
      <h1 class="flex-1 m-0 font-semibold text-base sm:text-sm capitalize">
        Send Transaction
      </h1>
      <DateTime :datetime="request.receivedTime" />
    </div>
    <p class="text-xs text-zinc-400">
      {{ appStore.name }} requests your permission to send this transaction to
      the {{ rpcStore.selectedRpcConfig?.chainName }}. Please specify gas while
      submitting the transaction.
    </p>
    <div class="flex-1">
      <div class="flex flex-col justify-between">
        <div class="space-x-1 flex items-baseline">
          <span class="text-xs text-zinc-400">Gas Fees</span>
          <div class="space-x-1">
            <span class="sm:text-xs">{{ gasFee }}</span>
            <span class="text-xs">{{ GAS_FEE_UNIT }}</span>
          </div>
        </div>
        <div class="space-x-1">
          <span class="text-xs text-zinc-400">Transaction Time:</span>
          <span class="text-xs"> ~{{ transactionTime }} mins </span>
        </div>
      </div>
    </div>
    <div class="flex justify-end space-x-2 text-sm">
      <button class="uppercase" @click="emits('reject')">Reject</button>
      <button class="uppercase" @click="emits('approve')">Approve</button>
    </div>
  </div>
</template>
