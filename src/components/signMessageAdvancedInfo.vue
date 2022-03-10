<template>
  <div class="sign_message-advanced_info">
    <div class="sign_message-advanced_info-container">
      <VJsonViewer :value="smartContract"></VJsonViewer>
    </div>
    <div class="sign_message-advanced_info-container">
      <p class="sign_message-advanced_info_label">Domain</p>
      <div>
        <VJsonViewer :value="domain"></VJsonViewer>
      </div>
    </div>
    <div class="sign_message-advanced_info-container">
      <p class="sign_message-advanced_info_label">Message</p>
      <div>
        <VJsonViewer :value="message"></VJsonViewer>
      </div>
    </div>
  </div>
</template>

<script>
import VJsonViewer from "./VJsonViewer.vue";
export default {
  name: "SignMessageAdvancedInfo",
  data() {
    return {
      domain: {
        Domain: { name: "DropBox.com" },
        Name: "DropxBox.com",
        VerifyingContract: "0x4b56326328723819829",
        Version: "1",
        Salt: "aa029182729jasbnu3i21291209aaerebc",
      },
      message: {
        Message: { orderHash: "DropBox.com" },
        OrderHash: "0x4b56326328723819829",
        Amount: 0,
        Address: "0x4b32632872381982928723819829",
        Nonce: 1,
      },
      smartContract: {
        SmartContract: "0x4b56326328723819829",
      },
    };
  },
  components: { VJsonViewer },
};
</script>

<style scoped>
.sign_message-advanced_info {
  width: 298px;
  height: 292px;
  padding: 20px 15px;
  background: #eeeeee;
  box-shadow: inset -1px -1px 1px rgba(255, 255, 255, 0.7),
    inset 1px 1px 2px rgba(174, 174, 192, 0.2);
  border-radius: 10px;

  overflow: auto;
}

.sign_message-advanced_info_label {
  font-weight: 600;
  font-size: 12px;
  margin: 0;
  margin-bottom: 5px;
}

.sign_message-advanced_info_value {
  font-size: 10px;
  color: #932a9b;
  margin: 0;
  margin-bottom: 4px;
}

.sign_message-advanced_info-container {
  margin-bottom: 10px;
}
</style>
