<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'vue-toastification'

import { useAppStore } from '@/store/app'
import { errors } from '@/utils/content'
import { getImage } from '@/utils/getImage'
import { getStorage } from '@/utils/storageWrapper'
import { useSVGInjector } from '@/utils/useSvgInjector.ts'
import { getFontFaimly, getFontSizeStyle } from '@/utils/utilsFunction'

const emit = defineEmits(['verify', 'close'])
const toast = useToast()
const storage = getStorage()
const mnemonic = storage.session.getMnemonic()
const keyArray: string[] = mnemonic.split(' ')
const seedPhrase = keyArray.join(' ')
const appStore = useAppStore()
async function copyToClipboard(value: string, message: string) {
  try {
    await navigator.clipboard.writeText(value)
    toast.success(message)
  } catch (err) {
    toast.error(errors.COPY)
  }
}

async function printKey() {
  window.print()
}

const copyContainer = ref<HTMLElement | null>(null)
const printContainer = ref<HTMLElement | null>(null)

const svgRefs = [copyContainer, printContainer]

const { fetchAndInjectSVG } = useSVGInjector(svgRefs)
</script>

<template>
  <div class="flex flex-col justify-between">
    <div class="relative flex justify-center items-center">
      <span class="font-Nohemi text-xl font-semibold">Seed Phrase</span>
    </div>
    <form
      class="flex flex-col flex-grow justify-between mt-2"
      @submit.prevent="emit('verify')"
    >
      <div class="flex flex-col gap-6">
        <span
          class="text-center"
          :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
          :style="{
            fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
              .primaryFontClass,
            color: appStore.theme_settings.font_color,
          }"
        >
          Please record the seed phrase shown below exactly in the order that it
          is shown. Take care to record this in a safe place offline for maximum
          safety.
        </span>
      </div>
      <div class="grid grid-cols-3 gap-3 my-4">
        <div
          v-for="(word, index) in keyArray"
          :key="index"
          class="flex justify-center"
        >
          <div class="relative w-full">
            <input
              type="text"
              :value="word"
              class="input-secondary w-full h-10 pl-6"
              readonly
            />
            <span
              class="absolute left-2 top-[21px] transform -translate-y-1/2 text-xs"
              >{{ index + 1 }}.</span
            >
          </div>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-1 mt-4">
        <button
          class="btn-tertiary flex items-center justify-center gap-2 py-2"
          type="button"
          @click.stop="
            copyToClipboard(seedPhrase, 'Seed phrase copied to memory')
          "
        >
          <div ref="copyContainer">
            <img
              :src="getImage('copy.svg')"
              alt="Copy Icon"
              @load="(event) => fetchAndInjectSVG(event, 0)"
            />
          </div>

          <span
            :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
            :style="{
              fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                .primaryFontClass,
              color: appStore.theme_settings.font_color,
            }"
            >Copy</span
          >
        </button>
        <button
          class="btn-tertiary flex items-center justify-center gap-2 py-2"
          type="button"
          @click="printKey"
        >
          <div ref="printContainer">
            <img
              :src="getImage('print.svg')"
              class="h-4"
              alt="Print Icon"
              @load="(event) => fetchAndInjectSVG(event, 1)"
            />
          </div>
          <span
            :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
            :style="{
              fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                .primaryFontClass,
              color: appStore.theme_settings.font_color,
            }"
            >Print</span
          >
        </button>
      </div>
      <div class="flex mt-2">
        <button
          class="btn-primary py-[10px] text-center w-full"
          type="submit"
          :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
          :style="{
            fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
              .primaryFontClass,
            color: appStore.theme_settings.font_color,
            borderColor: appStore.theme_settings.accent_color,
            backgroundColor: appStore.theme_settings.accent_color,
          }"
        >
          Verify
        </button>
      </div>
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
</template>
