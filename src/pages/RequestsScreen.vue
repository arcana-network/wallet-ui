<script setup lang="ts">
import { toRefs, watch } from 'vue'
import { useToast } from 'vue-toastification'
import Popper from 'vue3-popper'

import ChargeInfo from '@/components/ChargeInfo.vue'
import SendTransaction from '@/components/SendTransaction.vue'
import SignMessage from '@/components/SignMessage.vue'
import SignMessageNoRequests from '@/components/signMessageNoRequests.vue'
import { router } from '@/routes'
import { useAppStore } from '@/store/app'
import { useRequestStore } from '@/store/request'
import { useRpcStore } from '@/store/rpc'
import { content, errors } from '@/utils/content'
import { useImage } from '@/utils/useImage'

const getImage = useImage()
const requestStore = useRequestStore()
const toast = useToast()
const rpcStore = useRpcStore()
const appStore = useAppStore()

const { pendingRequest, areRequestsPendingForApproval } = toRefs(requestStore)

const onApproveClick = (requestId) => {
  if (isSendTransactionRequest(requestId)) {
    const request = requestStore.pendingRequests[requestId].request
    if (Array.isArray(request.params)) {
      const param = request.params[0]
      if (param.type === 2) {
        requestStore.setGasFee(null, requestId)
      } else {
        const gasPrice = String(param.gasPrice)
        if (!gasPrice.length) {
          toast.error(content.GAS.PROVIDE)
          return
        }
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
  return method === 'eth_sendTransaction'
}

function handleGasPriceInput({ value, requestId }) {
  requestStore.setGasFee(value, requestId)
}

watch(areRequestsPendingForApproval, () => {
  if (!areRequestsPendingForApproval.value) {
    router.push({ name: 'home' })
  }
})
</script>

<template>
  <div v-if="areRequestsPendingForApproval" class="flex flex-col h-full gap-2">
    <div
      v-if="pendingRequest"
      class="sign__messages-container rounded-[10px] flex flex-1 flex-col h-[80%]"
      :class="{ wallet__card: !appStore.compactMode }"
    >
      <div
        :key="Number(pendingRequest.request.id)"
        class="sign__message-container"
      >
        <SendTransaction
          v-if="isSendTransactionRequest(pendingRequest.request.id)"
          :request="pendingRequest"
          @gas-price-input="handleGasPriceInput"
          @reject="() => onRejectClick(pendingRequest?.request.id)"
          @approve="() => onApproveClick(pendingRequest?.request.id)"
        />
        <SignMessage
          v-else
          :request="pendingRequest"
          @reject="() => onRejectClick(pendingRequest?.request.id)"
          @approve="() => onApproveClick(pendingRequest?.request.id)"
        />
        <div v-if="rpcStore.isArcanaNetwork" class="sign__message-footer">
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
        </div>
      </div>
    </div>
  </div>
  <SignMessageNoRequests v-else />
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
