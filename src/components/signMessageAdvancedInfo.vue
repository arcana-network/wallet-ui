<script setup>
import VJsonViewer from '@/components/VJsonViewer.vue'

defineProps({
  info: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div class="sign__message-advanced-info">
    <div class="sign__message-advanced-info-container">
      <VJsonViewer :value="info"></VJsonViewer>
    </div>
  </div>
</template>

<style scoped>
.sign__message-advanced-info {
  width: 298px;
  max-height: 292px;
  padding: 20px 15px;
  overflow: auto;
  background: var(--debossed-box-color);
  border-radius: 10px;
  box-shadow: var(--debossed-shadow);
}

.sign__message-advanced-info-label {
  margin: 0;
  margin-bottom: 5px;
  font-size: 12px;
  font-weight: 600;
}

.sign__message-advanced-info-container {
  margin-bottom: 10px;
}
</style>
