<script setup lang="ts">
import { ref } from 'vue'
import VueQrious from 'vue-qrious'
import { useToast } from 'vue-toastification'

import { useAppStore } from '@/store/app'
import { useUserStore } from '@/store/user'
import { content, errors } from '@/utils/content'
import { getImage } from '@/utils/getImage'
import { useSVGInjector } from '@/utils/useSvgInjector.ts'
import { getFontFaimly, getFontSizeStyle } from '@/utils/utilsFunction'

const userStore = useUserStore()
const toast = useToast()
const appStore = useAppStore()

async function copyToClipboard(value: string) {
  try {
    await navigator.clipboard.writeText(value)
    toast.success(content.WALLET.COPY)
  } catch (err) {
    toast.error(errors.WALLET.COPY)
  }
}

const copyContainer = ref<HTMLElement | null>(null)

const svgRefs = [copyContainer]

const { fetchAndInjectSVG } = useSVGInjector(svgRefs)
</script>

<template>
  <div class="flex flex-col">
    <div class="flex items-center justify-center">
      <p class="font-Nohemi text-[20px] font-medium">Receive Tokens</p>
    </div>
    <p
      class="text-center"
      :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
      :style="{
        fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
          .primaryFontClass,
        color: appStore.theme_settings.font_color,
      }"
    >
      Scan QR code to copy your address in order to send tokens to this address.
    </p>
  </div>
  <div
    class="flex justify-center items-center mt-4 p-2 bg-white-100 rounded-sm"
  >
    <VueQrious
      :value="userStore.walletAddress"
      :size="400"
      class="w-full h-full"
    />
  </div>
  <div class="flex items-center justify-center gap-1 mt-4">
    <p class="text-lg font-medium">{{ userStore.walletAddressShrinked }}</p>
    <button
      class="w-lg h-lg"
      title="Click to copy wallet address"
      @click="copyToClipboard(userStore.walletAddress)"
    >
      <div ref="copyContainer">
        <img
          :src="getImage('copy.svg')"
          alt="Copy Icon"
          @load="(event) => fetchAndInjectSVG(event, 0)"
        />
      </div>
    </button>
  </div>
</template>
