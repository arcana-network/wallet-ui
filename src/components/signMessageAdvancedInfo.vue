<script setup lang="ts">
import VJsonViewer from '@/components/VJsonViewer.vue'

defineProps({
  info: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div class="sign__message-advanced-info debossed-card">
    <div class="sign__message-advanced-info-container">
      <VJsonViewer :value="info"></VJsonViewer>
    </div>
  </div>
</template>

<style scoped>
.sign__message-advanced-info {
  max-height: 300px;
  padding: var(--p-500) var(--p-400);
  overflow: auto;
}

.sign__message-advanced-info-label {
  margin: 0;
  margin-bottom: 5px;
  font-size: var(--fs-300);
  font-weight: 600;
}

.sign__message-advanced-info-container {
  margin-bottom: 10px;
}
</style>
