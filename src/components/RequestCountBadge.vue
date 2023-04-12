<script setup lang="ts">
defineProps({
  requestCount: {
    type: Number,
    required: true,
  },
})
</script>

<template>
  <span class="w-5 h-5 flex">
    <span
      class="animate-ping absolute h-full w-full rounded-full bg-[#b43030] opacity-75"
    ></span>
    <span
      class="flex items-center justify-center rounded-full w-5 h-5 bg-[#b43030] text-xs font-medium"
      >{{ requestCount }}</span
    >
  </span>
</template>
