<script setup lang="ts">
import { onMounted, ref } from 'vue'

const showComponent = ref(false)

defineProps({
  requestCount: {
    type: Number,
    required: true,
  },
})

onMounted(() => {
  // this is to fix issue when css transition is applied on Iframe window
  setTimeout(() => {
    showComponent.value = true
  }, 500)
})
</script>

<template>
  <span v-if="showComponent" class="w-5 h-5 flex">
    <span
      class="animate-ping absolute h-full w-full rounded-full bg-[#b43030] opacity-75"
    ></span>
    <span
      class="flex items-center justify-center rounded-full w-5 h-5 bg-[#b43030] text-xs font-medium"
      >{{ requestCount }}</span
    >
  </span>
</template>
