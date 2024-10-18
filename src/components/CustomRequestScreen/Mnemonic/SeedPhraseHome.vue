<script setup lang="ts">
import { ref } from 'vue'

import AppLoader from '@/components/AppLoader.vue'
import { useAppStore } from '@/store/app'
import { useUserStore } from '@/store/user'
import { getImage } from '@/utils/getImage'
import { getStorage } from '@/utils/storageWrapper'
import { getFontFaimly, getFontSizeStyle } from '@/utils/utilsFunction'

const emit = defineEmits(['proceed', 'close'])
const isLoading = ref(false)
const storage = getStorage()
const userStore = useUserStore()
const appStore = useAppStore()
function handleDismiss() {
  storage.local.sethasMVXSeedShown(userStore.info.id, true)
  emit('close')
}
function handleProceed() {
  storage.local.sethasMVXSeedShown(userStore.info.id, true)
  emit('proceed')
}
</script>

<template>
  <div>
    <AppLoader v-if="isLoading" message="Processing..." />
    <div v-else class="flex flex-col p-1">
      <div class="flex flex-col gap-3">
        <p
          class="text-center tracking-wide"
          :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
          :style="{
            fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
              .primaryFontClass,
            color: appStore.theme_settings.font_color,
          }"
        >
          Display Seed Phrase?
        </p>
        <p
          class="text-center"
          :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
          :style="{
            fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
              .primaryFontClass,
            color: appStore.theme_settings.font_color,
          }"
        >
          Would you like to view the seed phrase and record it now? You will
          <span class="font-bold">not be able to view</span>
          this later. The seed phrase is necessary to import this account into
          other MultiversX wallets.
        </p>
      </div>
      <form class="flex flex-col mt-5 space-y-2">
        <button
          class="flex-1 btn-primary py-[10px]"
          :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
          :style="{
            fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
              .primaryFontClass,
            color: appStore.theme_settings.font_color,
            borderColor: appStore.theme_settings.accent_color,
            backgroundColor: appStore.theme_settings.accent_color,
          }"
          @click.stop="handleProceed"
        >
          Display Seed Phrase
        </button>
        <button
          class="flex-1 btn-tertiary"
          :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
          :style="{
            fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
              .primaryFontClass,
            color: appStore.theme_settings.font_color,
            borderColor: appStore.theme_settings.accent_color,
            backgroundColor: appStore.theme_settings.accent_color,
          }"
          @click.stop="handleDismiss"
        >
          Skip and Proceed
        </button>
      </form>
      <div class="flex space-x-1 justify-center items-center pt-6">
        <span
          :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
          :style="{
            fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
              .primaryFontClass,
            color: appStore.theme_settings.font_color,
          }"
          >Powered by</span
        >
        <img :src="getImage('arcana-logo.svg')" alt="arcana" class="h-3" />
      </div>
    </div>
  </div>
</template>
