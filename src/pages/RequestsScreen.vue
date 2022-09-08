<script setup lang="ts">
import { toRefs } from 'vue'
import Popper from 'vue3-popper'

import ChargeInfo from '@/components/ChargeInfo.vue'
import SendTransaction from '@/components/SendTransaction.vue'
import SignMessage from '@/components/SignMessage.vue'
import SignMessageNoRequests from '@/components/signMessageNoRequests.vue'
import { useRequestStore } from '@/store/request'
import { useImage } from '@/utils/useImage'

const getImage = useImage()
const requestStore = useRequestStore()

const { pendingRequestsForApproval, areRequestsPendingForApproval } =
  toRefs(requestStore)

const onApproveClick = (requestID) => {
  requestStore.approveRequest(requestID)
}

const onRejectClick = (requestID) => {
  requestStore.rejectRequest(requestID)
}

const isSendTransactionRequest = (request) => {
  const { method } = request
  return method === 'eth_sendTransaction'
}
</script>

<template>
  <div v-if="areRequestsPendingForApproval" class="sign__messages-container">
    <div
      v-for="pendingRequest in pendingRequestsForApproval"
      :key="pendingRequest.request.id"
      class="sign__message-container"
    >
      <SendTransaction
        v-if="isSendTransactionRequest(pendingRequest.request)"
        :request="pendingRequest"
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
            <template #content> <ChargeInfo /> </template>
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

.sign__message-body {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.sign__message-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}

.sign__message-title-container {
  display: flex;
  align-items: baseline;
}

.sign__message-title {
  flex: 1;
  margin: 0;
  font-size: var(--fs-450);
  font-weight: 600;
}

.sign__message-permission {
  font-size: var(--fs-350);
  font-weight: 400;
}

.sign__message-text {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
  font-size: var(--fs-400);
  font-weight: 600;
  color: var(--fg-color);
  text-align: center;
  background: var(--debossed-box-color);
  border-radius: 10px;
  box-shadow: var(--debossed-shadow);
}

.sign__message-view-info {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-300);
  font-weight: 600;
  color: var(--fg-color);
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

.sign__message-arrow-icon {
  width: 7px;
  height: 3px;
  margin-left: 6px;
  transition: all 0.5s;
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

.sign__message-network-name-label {
  font-size: var(--fs-250);
  font-weight: 600;
  color: var(--fg-color-secondary);
}

.sign__message-network-name-value {
  font-size: var(--fs-400);
}

.sign__message-button-reject:hover,
.sign__message-button-approve:hover {
  transition: all 0.5s;
  transform: scale(1.05, 1.05);
}

.arrow__up {
  transform: rotate(180deg);
}

@media (max-width: 235px) {
  .sign__message-text {
    height: 40px;
  }
}
</style>
