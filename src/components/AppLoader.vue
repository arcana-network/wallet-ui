<script setup lang="ts">
import SpinningLoader from '@/components/SpinningLoader.vue'
import { useAppStore } from '@/store/app'
import { getFontFaimly, getFontSizeStyle } from '@/utils/utilsFunction'

type LoaderProps = {
  message: string
}

const appStore = useAppStore()

const props = defineProps<LoaderProps>()
</script>

<template>
  <div class="flex flex-col gap-4 justify-center items-center">
    <SpinningLoader />
    <p
      :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
      :style="{
        fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
          .primaryFontClass,
        color: appStore.theme_settings.font_color,
      }"
    >
      {{ props.message }}
    </p>
  </div>
</template>
