<script setup>
import { ref } from "vue";
import SignMessageAdvancedInfo from "@/components/signMessageAdvancedInfo.vue";
import { useRouter } from "vue-router";
import { useRequestStore } from "@/store/request";
import { methodAndAction } from "@/utils/method";

const router = useRouter();
const requestStore = useRequestStore();
const { method, params } = requestStore.currentRequest;

const action = methodAndAction[method];

const onApproveClick = () => {
  requestStore.approveRequest();
  router.back();
};

const onRejectClick = () => {
  requestStore.rejectRequest();
  router.back();
};

const showAdvancedInfo = ref(false);
</script>

<template>
  <div class="sign_message-container">
    <div class="sign_message-body">
      <div class="sign_message-title_container">
        <h1 class="sign_message-title">Sign Message</h1>
        <time class="sign_message-datetime">27 Jul 21, 7:21 pm</time>
      </div>
      <p class="sign_message-permission">
        DropBox.com requests your permission to perform the following action:
      </p>
      <p class="sign_message-text">{{ action }}</p>
      <button
        class="sign_message-view_info"
        v-on:click="showAdvancedInfo = !showAdvancedInfo"
      >
        View Advanced Information
        <!--Todo: use theme var to change arrow icon (dark or light) -->
        <img
          class="sign_message-arrow_icon"
          :class="{ arrow_up: showAdvancedInfo }"
          src="../assets/images/arrow-icon.png"
        />
      </button>
      <SignMessageAdvancedInfo v-if="showAdvancedInfo" :info="params" />
    </div>
    <div class="sign_message-footer">
      <p class="sign_message-info_text">
        You are not going to be charged!
        <!--Todo: use theme var to change info icon (dark or light) -->
        <img
          class="sign_message-info_icon"
          src="../assets/images/info-icon.png"
        />
      </p>
      <div class="sign_message-button_container">
        <button class="sign_message_button-reject" @click="onRejectClick">
          Reject
        </button>
        <button class="sign_message_button-approve" @click="onApproveClick">
          Approve
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sign_message-container {
  padding: 20px 15px;
  height: 100%;
  display: flex;
  flex-direction: column;

  overflow: auto;
}

.sign_message-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding-bottom: 15px;
}

.sign_message-footer {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: 70px;
}

.sign_message-title_container {
  display: flex;
  align-items: baseline;
  margin-bottom: 15px;
}

.sign_message-title {
  font-weight: 600;
  font-size: 20px;
  margin: 0;
  flex: 1;
}

.sign_message-datetime {
  font-weight: 300;
  font-size: 12px;

  color: #8d8d8d;
  flex: 1;
  text-align: right;
}

.sign_message-permission {
  font-weight: 400;
  font-size: 14px;
  margin-bottom: 20px;
}

.sign_message-text {
  background: var(--debossed-box-color);
  font-weight: 600;
  font-size: 16px;
  padding: 30px 30px;
  color: var(--fg-color);
  border-radius: 10px;
  box-shadow: var(--debossed-shadow);
  text-align: center;
  margin-bottom: 15px;
}

.sign_message-view_info {
  font-weight: 600;
  font-size: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 15px;
  color: var(--fg-color);
}

.sign_message-info_text {
  font-size: 10px;
  display: flex;
  color: var(--fg-color);
}

.sign_message-info_icon {
  height: 12.5px;
  width: 12.5px;
  margin-left: 6px;
}

.sign_message-arrow_icon {
  width: 7px;
  height: 3px;
  margin-left: 6px;
  transition: all 0.5s;
}

.sign_message-button_container {
  width: 100%;
  display: flex;
  justify-content: space-around;
}

.sign_message_button-reject,
.sign_message_button-approve {
  flex: 1;
  font-weight: 600;
  font-size: 14px;
  padding: 10px;
  border: 2px solid #101010;
  border-radius: 10px;
  text-transform: uppercase;
}

.sign_message_button-reject:hover,
.sign_message_button-approve:hover {
  transform: scale(1.05, 1.05);
  transition: all 0.5s;
}

.sign_message_button-reject {
  margin-right: 5px;
  border-color: var(--outlined-button-border-color);
  color: var(--outlined-button-fg-color);
}

.sign_message_button-approve {
  margin-left: 5px;
  background-color: var(--filled-button-bg-color);
  text-transform: uppercase;
  color: var(--filled-button-fg-color);
}

.arrow_up {
  transform: rotate(180deg);
}
</style>
