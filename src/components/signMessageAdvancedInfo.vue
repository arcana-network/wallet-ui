<script setup lang="ts">
import VJsonViewer from '@/components/VJsonViewer.vue'

const props = defineProps({
  info: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div
    class="bg-black-100 p-4 break-word rounded-md overflow-hidden break-words"
  >
    <VJsonViewer :value="info"></VJsonViewer>
  </div>
</template>
