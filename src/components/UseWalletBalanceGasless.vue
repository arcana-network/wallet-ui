<script setup lang="ts">
import { useAppStore } from '@/store/app'
import { useGaslessStore } from '@/store/gasless'
import { getFontFaimly, getFontSizeStyle } from '@/utils/utilsFunction'

const gaslessStore = useGaslessStore()
const appStore = useAppStore()

function approve() {
  gaslessStore.canUseWalletBalance = true
}

function reject() {
  gaslessStore.canUseWalletBalance = false
}
</script>

<template>
  <div class="space-y-2">
    <p
      class="text-center"
      :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
      :style="{
        fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
          .primaryFontClass,
        color: appStore.theme_settings.font_color,
      }"
    >
      Seems like the gas tank is empty, would you like to use your wallet to pay
      gas fee?
    </p>
    <div class="flex gap-2 text-sm font-medium">
      <button
        class="w-full btn-secondary p-2"
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
          borderColor: appStore.theme_settings.accent_color,
          backgroundColor: appStore.theme_settings.accent_color,
        }"
        @click="reject"
      >
        Reject
      </button>
      <button
        class="w-full btn-primary p-2"
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
          borderColor: appStore.theme_settings.accent_color,
          backgroundColor: appStore.theme_settings.accent_color,
        }"
        @click="approve"
      >
        Approve
      </button>
    </div>
  </div>
</template>
