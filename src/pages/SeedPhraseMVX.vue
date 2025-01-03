<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

import AppLoader from '@/components/AppLoader.vue'
import SendTokensPreview from '@/components/SendTokensPreview.vue'
import { useAppStore } from '@/store/app'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import { getImage } from '@/utils/getImage'
import { getMnemonicInShard } from '@/utils/multiversx/shard'
import { useSVGInjector } from '@/utils/useSvgInjector.ts'
import { getFontFaimly, getFontSizeStyle } from '@/utils/utilsFunction'

const showPreview = ref(false)
const router = useRouter()
const toast = useToast()
const appStore = useAppStore()

const loader = ref({
  show: false,
  message: '',
})

function showLoader(message) {
  loader.value.show = true
  loader.value.message = `${message}...`
}

function hideLoader() {
  loader.value.show = false
  loader.value.message = ''
}

const backContainer = ref<HTMLElement | null>(null)
const copyContainer = ref<HTMLElement | null>(null)

const svgRefs = [backContainer, copyContainer]

const { fetchAndInjectSVG } = useSVGInjector(svgRefs)
</script>

<template>
  <div class="flex flex-col justify-between">
    <div class="relative flex justify-center items-center">
      <button
        class="absolute left-0"
        title="Click to go back"
        @click.stop="router.push({ name: 'home' })"
      >
        <div ref="backContainer">
          <img
            :src="getImage('back-arrow.svg')"
            class="w-6 h-6"
            alt="Back Icon"
            @load="(event) => fetchAndInjectSVG(event, 0)"
          />
        </div>
      </button>
      <span class="font-Nohemi text-[20px] font-medium">Seed Phrase</span>
    </div>

    <form class="flex flex-col flex-grow justify-between mt-5">
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

      <!-- 3x8 Grid of Input Boxes -->
      <div class="grid grid-cols-3 gap-3 my-4">
        <div v-for="i in 24" :key="i" class="flex justify-center">
          <input
            type="text"
            :value="i + '.' + ' ' + 'Word'"
            class="input-field border w-full h-10"
            readonly
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-1 mt-4">
        <button
          class="btn-tertiary flex items-center justify-center gap-2 py-2"
        >
          <div ref="copyContainer">
            <img
              :src="getImage('copy.svg')"
              alt="copy Icon"
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
            >Copy
          </span>
        </button>

        <button
          class="btn-tertiary flex items-center justify-center gap-2 py-2"
          :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
          :style="{
            fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
              .primaryFontClass,
            color: appStore.theme_settings.font_color,
            borderColor: appStore.theme_settings.accent_color,
            backgroundColor: appStore.theme_settings.accent_color,
          }"
        >
          <!-- <img :src="getImage('print.svg')" alt="Print wallet address" /> -->
          Print
        </button>
      </div>

      <div class="flex mt-2">
        <button
          class="btn-primary py-[10px] text-center w-full"
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
  </div>
</template>
