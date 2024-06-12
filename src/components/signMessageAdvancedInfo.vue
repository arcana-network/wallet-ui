<script setup lang="ts">
import { computed } from 'vue'

import VJsonViewer from '@/components/VJsonViewer.vue'

const props = defineProps<{ info: any }>()

const signInfo = computed(() => {
  return props.info as any
})
</script>

<template>
  <div
    class="card dark:bg-black-100 h-full p-2 break-word rounded-md overflow-hidden break-words"
  >
    <div class="overflow-auto h-full w-full">
      <VJsonViewer :value="signInfo"></VJsonViewer>
    </div>
  </div>
</template>
