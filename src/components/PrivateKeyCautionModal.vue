<script setup lang="ts">
import { useAppStore } from '@/store/app'
import { DOCS_URL } from '@/utils/constants'
import { getFontFaimly, getFontSizeStyle } from '@/utils/utilsFunction'

const appStore = useAppStore()

const emit = defineEmits(['proceed', 'close'])
</script>

<template>
  <div class="p-3 flex flex-col gap-4">
    <div class="font-Nohemi text-center text-[20px] font-medium">
      Export Private Key
    </div>
    <div
      class="flex flex-col gap-2"
      :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
      :style="{
        fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
          .primaryFontClass,
        color: appStore.theme_settings.font_color,
      }"
    >
      <p>
        Use this utility to export your private keys to create a backup or to
        use your address with other wallet providers.
      </p>
      <p>
        Please store your keys in a safe place as anyone with access to it can
        take over your wallet.
        <a
          :href="`${DOCS_URL}/howto/wallet_exkey.html`"
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
