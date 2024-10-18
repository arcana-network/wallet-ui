<script setup lang="ts">
import { computed } from 'vue'

import { useAppStore } from '@/store/app'
import { getFontFaimly, getFontSizeStyle } from '@/utils/utilsFunction'

const props = defineProps<{ accountType: 'scw' | 'eoa' }>()
const appStore = useAppStore()
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
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
      >
        {{ label }}
      </span>
    </div>
  </div>
</template>
