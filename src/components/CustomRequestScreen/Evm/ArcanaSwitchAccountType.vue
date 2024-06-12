<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ accountType: 'scw' | 'eoa' }>()

const label = computed(() => {
  return props.accountType === 'scw'
    ? 'Smart Contract Wallet'
    : 'Externally Owned Address'
})
</script>

<template>
  <div class="flex flex-col gap-2 text-sm">
    <div class="flex justify-between gap-4">
      <span class="w-[120px]">Switch Account To</span>
      <span
        class="w-[200px] text-right whitespace-nowrap overflow-hidden text-ellipsis"
        :title="label"
      >
        {{ label }}
      </span>
    </div>
  </div>
</template>
