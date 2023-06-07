<script setup lang="ts">
import { watch, computed } from 'vue'
import { useToast } from 'vue-toastification'

import SendTransaction from '@/components/SendTransaction.vue'
import SignMessage from '@/components/SignMessage.vue'
import { router } from '@/routes'
import { useRequestStore } from '@/store/request'

const requestStore = useRequestStore()
const toast = useToast()
console.log(requestStore.skippedRequests)

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
        toast.error('Please provide Gas Fee')
        return
      }
    }
  }
  requestStore.approveSkippedRequest(requestId)
}

const onRejectClick = (requestId) => {
  requestStore.rejectSkippedRequest(requestId)
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
    if (!requestStore.skippedRequestsPendingForApprovalLength) {
      router.push({ name: 'home' })
    }
  }
)
</script>

<template>
  <div class="relative card flex flex-col gap-2">
    <div class="card z-30 relative">
      <SendTransaction
        v-if="isSendTransactionRequest(currentRequest.request.id)"
        :request="currentRequest"
        @gas-price-input="handleGasPriceInput"
        @reject="() => onRejectClick(currentRequest?.request.id)"
        @approve="() => onApproveClick(currentRequest?.request.id)"
      />
      <SignMessage
        v-else
        :request="currentRequest"
        @reject="() => onRejectClick(currentRequest?.request.id)"
        @approve="() => onApproveClick(currentRequest?.request.id)"
      />
    </div>
    <div
      v-if="requestStore.skippedRequestsForApproval.length > 1"
      class="border-gray-800 dark:border-gray-200 bg-white-300 dark:bg-black-300 border rounded-md absolute w-[90%] h-full -bottom-2 left-1/2 transform -translate-x-1/2 z-20"
    ></div>
    <div
      v-if="requestStore.skippedRequestsForApproval.length > 2"
      class="border-gray-800 dark:border-gray-200 bg-white-300 dark:bg-black-300 border rounded-md absolute w-[82%] h-full -bottom-4 left-1/2 transform -translate-x-1/2 z-10"
    ></div>
  </div>
</template>

<style scoped>
.sign__messages-container {
  height: 100%;
  overflow: hidden;
}

.sign__message-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: var(--p-400);
  overflow: auto;
}

.sign__message-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}

.sign__message-info-text {
  display: flex;
  align-items: center;
  font-size: var(--fs-300);
  color: var(--fg-color);
}

.sign__message-info-icon {
  width: 12.5px;
  height: 12.5px;
  margin-left: 6px;
}

.sign__message-button-container {
  width: calc(100% + 2rem);
  background: var(--request-footer-bg);
}

.sign__message-button-reject,
.sign__message-button-approve {
  flex: 1;
  padding: var(--p-250);
  font-size: var(--fs-350);
  font-weight: 600;
  text-transform: uppercase;
  border: 2px solid #101010;
  border-radius: 10px;
}

.sign__message-button-reject {
  margin-right: 5px;
  color: var(--outlined-button-fg-color);
  border-color: var(--outlined-button-border-color);
}

.sign__message-button-approve {
  margin-left: 5px;
  color: var(--filled-button-fg-color);
  text-transform: uppercase;
  background-color: var(--filled-button-bg-color);
}

.sign__message-button-reject:hover,
.sign__message-button-approve:hover {
  transition: all 0.5s;
  transform: scale(1.05, 1.05);
}
</style>
