<script setup>
import { onMounted, ref } from 'vue'

import { useAppStore } from '@/store/app'
import { useConfigStore } from '@/store/config'

const appStore = useAppStore()
const color = ref('')

onMounted(async () => {
  const config = await useConfigStore(appStore.id)
  const accentColor = config.themeSettings.accent_color
  color.value = accentColor
})
</script>

<template>
  <button :style="{ color: color, borderColor: color }">
    <slot />
  </button>
</template>
