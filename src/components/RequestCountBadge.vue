<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { useAppStore } from '@/store/app'
import { getFontFaimly, getFontSizeStyle } from '@/utils/utilsFunction'

const showComponent = ref(false)
const appStore = useAppStore()
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
      class="flex items-center justify-center rounded-full w-5 h-5 bg-[#b43030]"
      :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
      :style="{
        fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
          .primaryFontClass,
        color: appStore.theme_settings.font_color,
      }"
      >{{ requestCount }}</span
    >
  </span>
</template>
