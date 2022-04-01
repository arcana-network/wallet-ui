<script setup>
import VJsonViewer from "./VJsonViewer.vue";

defineProps({
  info: Object,
});
</script>

<template>
  <div class="sign_message-advanced_info">
    <div class="sign_message-advanced_info-container">
      <VJsonViewer :value="info"></VJsonViewer>
    </div>
  </div>
</template>

<style scoped>
.sign_message-advanced_info {
  width: 298px;
  height: 292px;
  padding: 20px 15px;
  background: var(--debossed-box-color);
  box-shadow: var(--debossed-shadow);

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
