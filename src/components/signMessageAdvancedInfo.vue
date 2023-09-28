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
  return props.info as any
})
</script>

<template>
  <div
    class="bg-black-100 p-4 break-word rounded-md overflow-hidden max-h-40 break-words"
  >
    <div class="overflow-auto h-full w-full">
      <VJsonViewer :value="signInfo"></VJsonViewer>
    </div>
  </div>
</template>
