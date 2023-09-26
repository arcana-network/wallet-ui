<script setup lang="ts">
import { AppMode } from '@jrstudio/auth'
import { Decimal } from 'decimal.js'
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import { useAppStore } from '@/store/app'
import { useParentConnectionStore } from '@/store/parentConnection'
import { useRequestStore } from '@/store/request'
import { useRpcStore } from '@/store/rpc'
import { GAS_FEE_UNIT } from '@/utils/constants'

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
  gasPrices: {
    type: Object,
    required: false,
    default: () => ({}),
  },
  gas: {
    type: Object,
    required: true,
  },
})

onMounted(async () => {
  setHeight()
})

const gasFee = computed(() => {
  if (props.gas?.maxFeePerGas) {
    return new Decimal(props.gas.maxFeePerGas)
      .add(props.gas.maxPriorityFeePerGas || 1.5)
      .toString()
  }
  return '0'
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
    <div class="flex-1">
      <div class="flex justify-center">
        <div class="flex justify-center gap-2 items-baseline">
          <span class="text-sm text-gray-100">Gas Fees</span>
          <div class="flex gap-1 items-baseline">
            <span class="text-lg font-bold">{{ gasFee }}</span>
            <span class="text-sm">{{ GAS_FEE_UNIT }}</span>
          </div>
        </div>
      </div>
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
