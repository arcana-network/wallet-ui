<script setup lang="ts">
import { useAppStore } from '@/store/app'
import { DOCS_URL } from '@/utils/constants'
import { getFontFaimly, getFontSizeStyle } from '@/utils/utilsFunction'

const emit = defineEmits(['proceed', 'close'])
const appStore = useAppStore()
</script>

<template>
  <div class="p-2 flex flex-col gap-3">
    <div class="flex justify-center">
      <div class="font-Nohemi text-[20px] font-medium">
        Enhance Wallet Security
      </div>
    </div>
    <div class="text-sm text-gray-spanish-light flex flex-col gap-2">
      <p
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
      >
        Turn on MFA by setting up security questions and a PIN. You will need to
        enter either of them to authenticate when you login to a new device or
        browser.
        <a
          :href="`${DOCS_URL}/concepts/mfa.html`"
          target="_blank"
          class="font-medium text-black-500 dark:text-white-100 cursor-pointer"
          >LEARN MORE</a
        >
      </p>
    </div>
    <div>
      <button
        class="p-2 btn-primary flex justify-center items-center w-full"
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
          borderColor: appStore.theme_settings.accent_color,
          backgroundColor: appStore.theme_settings.accent_color,
        }"
        @click.stop="emit('proceed')"
      >
        Proceed
      </button>
    </div>
  </div>
</template>
