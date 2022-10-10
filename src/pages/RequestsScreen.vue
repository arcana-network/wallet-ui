<script setup lang="ts">
import { toRefs } from 'vue'
import { useToast } from 'vue-toastification'
import Popper from 'vue3-popper'

import ChargeInfo from '@/components/ChargeInfo.vue'
import SendTransaction from '@/components/SendTransaction.vue'
import SignMessage from '@/components/SignMessage.vue'
import SignMessageNoRequests from '@/components/signMessageNoRequests.vue'
import { useRequestStore } from '@/store/request'
import { useImage } from '@/utils/useImage'

const getImage = useImage()
const requestStore = useRequestStore()
const toast = useToast()

const { pendingRequestsForApproval, areRequestsPendingForApproval } =
  toRefs(requestStore)

const onApproveClick = (requestId) => {
  if (isSendTransactionRequest(requestId)) {
    const request = requestStore.pendingRequests[requestId].request
    if (Array.isArray(request.params)) {
      const param = request.params[0]
      const gasPrice = String(param.gasPrice)
      if (!gasPrice.length) {
        toast.error('Please provide Gas Fee')
        return
      }
    }
  }
  requestStore.approveRequest(requestId)
}

const onRejectClick = (requestId) => {
  requestStore.rejectRequest(requestId)
}

const isSendTransactionRequest = (requestId) => {
  const {
    request: { method },
  } = requestStore.pendingRequests[requestId]
  console.log(
    requestStore.pendingRequests[requestId],
    'isSendTransactionRequest'
  )
  return method === 'eth_sendTransaction'
}

function handleGasPriceInput({ value, requestId }) {
  requestStore.setGasFee(value, requestId)
}
</script>

<template>
  <div class="wallet__card rounded-[10px] flex flex-1 flex-col mb-[10px]">
    <div v-if="areRequestsPendingForApproval" class="sign__messages-container">
      <div
        v-for="pendingRequest in pendingRequestsForApproval"
        :key="pendingRequest.request.id"
        class="sign__message-container"
      >
        <SendTransaction
          v-if="isSendTransactionRequest(pendingRequest.request.id)"
          :request="pendingRequest"
          @gas-price-input="handleGasPriceInput"
        />
        <SignMessage v-else :request="pendingRequest" />
        <div class="sign__message-footer">
          <p class="sign__message-info-text">
            You are not going to be charged!
            <Popper arrow hover>
              <button>
                <img
                  class="sign__message-info-icon"
                  :src="getImage('info-icon')"
                />
              </button>
              <template #content>
                <ChargeInfo />
              </template>
            </Popper>
          </p>
          <div class="sign__message-button-container">
            <button
              class="sign__message-button-reject"
              @click="onRejectClick(pendingRequest.request.id)"
            >
              Reject
            </button>
            <button
              class="sign__message-button-approve"
              @click="onApproveClick(pendingRequest.request.id)"
            >
              Approve
            </button>
          </div>
        </div>
      </div>
    </div>
    <SignMessageNoRequests v-else />
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
  display: flex;
  justify-content: space-around;
  width: 100%;
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
