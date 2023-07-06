<script setup lang="ts">
import { computed } from 'vue'

import VJsonViewer from '@/components/VJsonViewer.vue'

const props = defineProps({
  info: {
    type: Object,
    required: true,
  },
})

const signInfo = computed(() => {
  return props.info
})
</script>

<template>
  <div
    class="bg-black-100 p-4 break-word rounded-md overflow-auto max-h-40 break-words"
  >
    <VJsonViewer :value="signInfo"></VJsonViewer>
  </div>
</template>
