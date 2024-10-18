<script setup lang="ts">
import SolanaTransactionDetails from '@/components/CustomRequestScreen/Solana/TransactionDetails.vue'
import { useAppStore } from '@/store/app'
import { getFontFaimly, getFontSizeStyle } from '@/utils/utilsFunction'

const props = defineProps<{ message: string }>()
const appStore = useAppStore()
</script>

<template>
  <div class="flex flex-col gap-2 text-sm">
    <div
      class="uppercase text-black-arsenic dark:text-white-400"
      :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
      :style="{
        fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
          .primaryFontClass,
        color: appStore.theme_settings.font_color,
      }"
    >
      Transaction Details
    </div>
    <SolanaTransactionDetails :message="props.message" />
  </div>
</template>
