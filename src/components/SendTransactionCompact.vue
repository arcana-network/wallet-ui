<script setup lang="ts">
import { AppMode } from '@arcana/auth'
import { Decimal } from 'decimal.js'
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import { useAppStore } from '@/store/app'
import { useParentConnectionStore } from '@/store/parentConnection'
import { useRequestStore } from '@/store/request'
import { useRpcStore } from '@/store/rpc'

const emits = defineEmits(['reject', 'approve'])

const rpcStore = useRpcStore()
const appStore = useAppStore()
const parentConnectionStore = useParentConnectionStore()
const requestStore = useRequestStore()
const route = useRoute()

const props = defineProps({
  request: {
    type: Object,
    required: true,
  },
  gasLimit: {
    type: String,
    required: false,
    default: '',
  },
  gas: {
    type: Object,
    required: true,
  },
  baseFee: {
    type: String,
    required: false,
    default: '',
  },
})

onMounted(async () => {
  setHeight()
})

const gasFee = computed(() => {
  if (props.gas?.maxFeePerGas) {
    return new Decimal(props.gas.maxFeePerGas || props.baseFee)
      .add(props.gas.maxPriorityFeePerGas || 1.5)
      .mul(Decimal.pow(10, 9))
      .mul(props.gasLimit)
      .div(Decimal.pow(10, 18))
      .toString()
      .slice(0, 10)
  }
  return 'Unknown'
})

async function setHeight() {
  const parentConnectionInstance = await parentConnectionStore.parentConnection
    ?.promise
  await parentConnectionInstance?.setIframeStyle({
    ...appStore.iframeStyle(),
  })
}
</script>

<template>
  <div class="card p-4 flex flex-col h-full gap-4 justify-between">
    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-center">
        <h1 class="m-0 font-bold text-lg capitalize">Send Transaction</h1>
      </div>
      <p class="text-xs text-gray-100 text-center">
        The application “{{ appStore.name }}” is requesting your permission to
        send this transaction to {{ rpcStore.selectedRpcConfig?.chainName }}. Do
        you approve the transaction?
      </p>
    </div>
    <div class="flex flex-col gap-1 flex-1">
      <div class="flex justify-center">
        <div class="flex justify-center gap-2 items-baseline">
          <span class="text-sm text-gray-100">Transaction Fees</span>
          <div class="flex gap-1 items-baseline">
            <span class="text-lg font-bold">{{ gasFee }}</span>
            <span v-if="gasFee !== 'Unknown'" class="text-sm">{{
              rpcStore.selectedRPCConfig?.nativeCurrency?.symbol || 'Units'
            }}</span>
          </div>
        </div>
      </div>
      <!-- <div class="text-xs text-center">
        Expand the wallet to view more details
      </div> -->
    </div>
    <div class="flex flex-col gap-4">
      <div class="flex gap-2 text-sm font-bold">
        <button
          class="uppercase w-full btn-secondary p-2"
          @click="emits('reject')"
        >
          Reject
        </button>
        <button
          class="uppercase w-full btn-primary p-2"
          @click="emits('approve')"
        >
          Approve
        </button>
      </div>
      <div
        v-if="
          route.name === 'requests' && appStore.validAppMode === AppMode.Full
        "
        class="flex items-center justify-center"
      >
        <button
          class="btn-tertiary text-sm font-bold"
          @click.stop="requestStore.skipRequest(request.request.id)"
        >
          Do this later
        </button>
      </div>
    </div>
  </div>
</template>
