<script setup lang="ts">
import SolanaTransactionDetails from '@/components/CustomRequestScreen/Solana/TransactionDetails.vue'
import { useAppStore } from '@/store/app'
import { getFontFaimly, getFontSizeStyle } from '@/utils/utilsFunction'

const props = defineProps<{ message: string[] }>()
const appStore = useAppStore()
</script>

<template>
  <div class="flex flex-col gap-8">
    <div
      v-for="(m, index) in props.message"
      :key="m"
      class="flex flex-col gap-2"
    >
      <div
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
      >
        Transaction #{{ index + 1 }}
      </div>
      <SolanaTransactionDetails :message="m" />
    </div>
  </div>
</template>
