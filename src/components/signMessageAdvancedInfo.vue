<template>
  <div class="sign_message-advanced_info">
    <div class="sign_message-advanced_info-container">
      <p class="sign_message-advanced_info_label">Smart Contract</p>
      <p class="sign_message-advanced_info_value">0x4b56326328723819829</p>
    </div>
    <div class="sign_message-advanced_info-container">
      <p class="sign_message-advanced_info_label">Domain</p>
      <div>
        <p class="sign_message-advanced_info_value">
          <span>Domain:</span>
          <span>Object {name: “DropBox.com”, verif...</span>
        </p>
        <p class="sign_message-advanced_info_value">
          <span>Name:</span> <span>“DropxBox.com”</span>
        </p>
        <p class="sign_message-advanced_info_value">
          <span>VerifyingContract:</span> <span>“0x4b56326328723819829</span>
        </p>
        <p class="sign_message-advanced_info_value">
          <span>Version:</span> <span>“1”</span>
        </p>
        <p class="sign_message-advanced_info_value">
          <span>Salt:</span> <span>“aa029182729jasbnu3i21291209aaerebc</span>
        </p>
      </div>
    </div>
    <div class="sign_message-advanced_info-container">
      <p class="sign_message-advanced_info_label">Message</p>
      <div>
        <p class="sign_message-advanced_info_value">
          <span>Message:</span>
          <span>Object {name: “DropBox.com”, verif...</span>
        </p>
        <p class="sign_message-advanced_info_value">
          <span>OrderHash:</span> <span>“DropxBox.com”</span>
        </p>
        <p class="sign_message-advanced_info_value">
          <span>Amount:</span> <span>“0”</span>
        </p>
        <p class="sign_message-advanced_info_value">
          <span>Address:</span>
          <span>“aa029182729jasbnu3i21291209aaerebc</span>
        </p>
        <p class="sign_message-advanced_info_value">
          <span>Nonce:</span> <span>“1”</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SignMessageAdvancedInfo",
};
</script>

<style>
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
