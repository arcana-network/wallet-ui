<script setup lang="ts">
import { watch, computed, ref } from 'vue'
import { useToast } from 'vue-toastification'

import SendTransaction from '@/components/SendTransaction.vue'
import SignMessage from '@/components/SignMessage.vue'
import { router } from '@/routes'
import { makeRequest } from '@/services/request.service'
import { useAppStore } from '@/store/app'
import { useRequestStore } from '@/store/request'
import { useRpcStore } from '@/store/rpc'
import { content } from '@/utils/content'

const requestStore = useRequestStore()
const rpcStore = useRpcStore()
const appStore = useAppStore()
const toast = useToast()
const shrinkMode = ref(true)

const currentRequest = computed(() => {
  return requestStore.skippedRequestsForApproval[0]
})

const onApproveClick = (requestId) => {
  if (isSendTransactionRequest(requestId)) {
    const request = requestStore.skippedRequests[requestId].request
    if (Array.isArray(request.params)) {
      const param = request.params[0]
      const gasPrice = String(param.gasPrice)
      if (!gasPrice.length) {
        toast.error(content.GAS.PROVIDE)
        return
      }
    }
  }
  requestStore.approveSkippedRequest(requestId)
}

const onRejectClick = (requestId) => {
  requestStore.rejectSkippedRequest(requestId)
}

const onProceedClick = async (request) => {
  function getRequestObject() {
    const requestObj = {
      method: request.method,
      params: [...JSON.parse(JSON.stringify(request.params))],
    }
    return {
      type: 'json_rpc_request',
      data: {
        requestOrigin: 'wallet-ui',
        request: requestObj,
        chainId: rpcStore.selectedChainId,
      },
    }
  }
  await makeRequest(appStore.id, getRequestObject())
  window.addEventListener('message', (event) => {
    const { data } = event
    const { type, response } = data
    if (type === 'json_rpc_response') {
      if (response.message === 'approve') {
        requestStore.approveSkippedRequest(request.id)
      } else if (response.message === 'reject') {
        requestStore.rejectSkippedRequest(request.id)
      }
    }
  })
}

const isSendTransactionRequest = (requestId) => {
  const {
    request: { method },
  } = requestStore.skippedRequests[requestId]
  return method === 'eth_sendTransaction'
}

function handleGasPriceInput({ value, requestId }) {
  requestStore.setGasFee(value, requestId)
}

watch(
  () => requestStore.skippedRequestsPendingForApprovalLength,
  () => {
    shrinkMode.value = true
    if (!requestStore.skippedRequestsPendingForApprovalLength) {
      router.push({ name: 'home' })
    }
  }
)
</script>

<template>
  <div class="relative card flex flex-col gap-2">
    <div class="card max-h-[400px] z-30 relative">
      <SendTransaction
        v-if="isSendTransactionRequest(currentRequest?.request.id)"
        :request="currentRequest"
        :shrink-mode="shrinkMode"
        @expand="shrinkMode = false"
        @shrink="shrinkMode = true"
        @gas-price-input="handleGasPriceInput"
        @reject="() => onRejectClick(currentRequest?.request.id)"
        @approve="() => onApproveClick(currentRequest?.request.id)"
        @proceed="onProceedClick(currentRequest.request)"
      />
      <SignMessage
        v-else
        :request="currentRequest"
        :shrink-mode="shrinkMode"
        @expand="shrinkMode = false"
        @shrink="shrinkMode = true"
        @reject="() => onRejectClick(currentRequest?.request.id)"
        @approve="() => onApproveClick(currentRequest?.request.id)"
        @proceed="onProceedClick(currentRequest.request)"
      />
    </div>
    <div
      v-if="requestStore.skippedRequestsForApproval.length > 1"
      class="border-gray-800 dark:border-gray-300 bg-gray-link-water dark:bg-black-crayola-50 border rounded-md absolute w-[94%] h-full -bottom-2 left-1/2 transform -translate-x-1/2 z-20"
    ></div>
  </div>
</template>
