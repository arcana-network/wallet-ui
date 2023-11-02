<script setup lang="ts">
import base58 from 'bs58'
import { computed } from 'vue'

import VJsonViewer from '@/components/VJsonViewer.vue'

const props = defineProps({
  info: {
    type: Object,
    required: true,
  },
})

const signInfo = computed(() => {
  console.log(base58.decode(props.info.message as unknown as string))
  const bs58decoded = new TextDecoder().decode(
    base58.decode(props.info.message as unknown as string)
  )
  return bs58decoded
  // return props.info as any
})
</script>

<template>
  <div
    class="card dark:bg-black-100 p-4 break-word rounded-md overflow-hidden max-h-40 break-words"
  >
    <div class="overflow-auto h-full w-full">
      <VJsonViewer :value="signInfo"></VJsonViewer>
    </div>
  </div>
</template>
