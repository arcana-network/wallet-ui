<script setup lang="ts">
import dayjs from 'dayjs'
import { ref, toRefs } from 'vue'

import SignMessageAdvancedInfo from '@/components/signMessageAdvancedInfo.vue'
import SignMessageNoRequests from '@/components/signMessageNoRequests.vue'
import { useRequestStore } from '@/store/request'
import { chargeInfo } from '@/utils/chargeInfo'
import { methodAndAction } from '@/utils/method'
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

const showAdvancedInfo = ref(false)
</script>

<template>
  <div v-if="areRequestsPendingForApproval" class="sign__messages-container">
    <div
      v-for="request in pendingRequestsForApproval"
      :key="request.id"
      class="sign__message-container"
    >
      <div class="sign__message-body flow-element">
        <div class="sign__message-title-container">
          <h1 class="sign__message-title">Sign Message</h1>
          <time class="sign__message-datetime">{{
            dayjs(request.receivedTime).format('DD MMM YY, hh:mm a')
          }}</time>
        </div>
        <p class="sign__message-permission">
          DropBox.com requests your permission to perform the following action:
        </p>
        <p class="sign__message-text">{{ methodAndAction[request.method] }}</p>
        <button
          class="sign__message-view-info"
          @click="showAdvancedInfo = !showAdvancedInfo"
        >
          View Advanced Information
          <img
            class="sign__message-arrow-icon"
            :class="{ arrow__up: showAdvancedInfo }"
            :src="getImage('arrow-icon')"
          />
        </button>
        <SignMessageAdvancedInfo
          v-if="showAdvancedInfo"
          :info="request.params"
        />
      </div>
      <div class="sign__message-footer">
        <p class="sign__message-info-text">
          You are not going to be charged!
          <button v-tooltip="chargeInfo">
            <img class="sign__message-info-icon" :src="getImage('info-icon')" />
          </button>
        </p>
        <div class="sign__message-button-container">
          <button
            class="sign__message-button-reject"
            @click="onRejectClick(request.id)"
          >
            Reject
          </button>
          <button
            class="sign__message-button-approve"
            @click="onApproveClick(request.id)"
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

.sign__message-datetime {
  flex: 1;
  font-size: var(--fs-300);
  font-weight: 300;
  color: #8d8d8d;
  text-align: right;
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
