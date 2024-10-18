<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'vue-toastification'

import { useAppStore } from '@/store/app'
import { AUTH_URL } from '@/utils/constants'
import { errors } from '@/utils/content'
import { downloadFile } from '@/utils/downloadFile'
import { getImage } from '@/utils/getImage'
import { useImage } from '@/utils/useImage'
import { useSVGInjector } from '@/utils/useSvgInjector.ts'
import { getFontFaimly, getFontSizeStyle } from '@/utils/utilsFunction'

const getIconImage = useImage()
const appStore = useAppStore()
const toast = useToast()

type ExportKeyModalProps = {
  privateKey: string
  walletAddress: string
  walletDomain?: string
}

const props = defineProps<ExportKeyModalProps>()

function sendCopyRequest(data) {
  const allowedDomain = props.walletDomain!
  window.parent.postMessage(
    {
      type: 'copy_to_clipboard',
      data,
    },
    allowedDomain
  )
}

function handlePrivateKeyDownload(privateKey, walletAddress) {
  const fileData = new Blob([privateKey], {
    type: 'text/plain',
  })
  downloadFile(`${walletAddress}-private-key.txt`, fileData)
}

async function copyToClipboard(value: string, message: string) {
  try {
    const a = new URL(AUTH_URL)
    const b = new URL(document.referrer)
    if (a.href === b.href) {
      sendCopyRequest(value)
    } else {
      await navigator.clipboard.writeText(value)
      toast.success(message)
    }
  } catch (err) {
    toast.error(errors.COPY)
  }
}

const copyContainer = ref<HTMLElement | null>(null)
const downloadContainer = ref<HTMLElement | null>(null)

const svgRefs = [copyContainer, downloadContainer]

const { fetchAndInjectSVG } = useSVGInjector(svgRefs)
</script>

<template>
  <div class="flex flex-col space-y-5">
    <div class="flex flex-col gap-1">
      <div class="flex items-center justify-between">
        <label
          :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
          :style="{
            fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
              .primaryFontClass,
            color: appStore.theme_settings.font_color,
          }"
          >Private Key</label
        >
      </div>
      <div
        class="bg-black-400 rounded-md p-4 break-words blur"
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
      >
        {{ props.privateKey }}
      </div>
    </div>
    <div class="flex gap-8 justify-center">
      <button
        class="flex gap-1 items-center justify-center btn-tertiary text-sm font-medium p-2"
        @click.stop="copyToClipboard(props.privateKey, 'Private Key Copied')"
      >
        <div ref="copyContainer">
          <img
            :src="getImage('copy.svg')"
            class="w-lg h-lg"
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
        class="flex gap-1 items-center justify-center btn-tertiary text-sm font-medium p-2"
        @click.stop="
          handlePrivateKeyDownload(props.privateKey, props.walletAddress)
        "
      >
        <div ref="downloadContainer">
          <img
            :src="getImage('download.svg')"
            class="w-lg h-lg"
            alt="Download Icon"
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
          >Download</span
        >
      </button>
    </div>
    <div class="flex space-x-3 bg-blue-dark-sky p-2 rounded-sm">
      <img
        class="w-5 h-5"
        :src="getIconImage('info-circle', undefined, 'svg')"
      />
      <span
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
      >
        Please close this tab immediately after you back up your private key!
      </span>
    </div>
  </div>
</template>
