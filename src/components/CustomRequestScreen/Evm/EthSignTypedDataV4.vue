<script setup lang="ts">
import { ComputedRef, computed } from 'vue'

import VJsonViewer from '@/components/VJsonViewer.vue'
import { getChainLogoUrl } from '@/services/chainlist.service'
import { useAppStore } from '@/store/app'
import { useRpcStore } from '@/store/rpc'
import { getImage } from '@/utils/getImage'
import { truncateMid } from '@/utils/stringUtils'
import { getFontFaimly, getFontSizeStyle } from '@/utils/utilsFunction'

const props = defineProps<{
  requestParams: string[]
}>()

const typedData = computed(() => {
  try {
    return JSON.parse(props.requestParams[1])
  } catch (e) {
    return {}
  }
}) as ComputedRef<{
  domain: {
    chainId: number
    name: string
    verifyingContract: string
    version: string
  }
  message: Record<string, unknown>
  primaryType: string
  types: Record<string, unknown>
}>

const rpcStore = useRpcStore()
const appStore = useAppStore()

function handleFallbackLogo(event) {
  event.target.src = getImage('blockchain-icon.png')
}
</script>

<template>
  <div class="card flex flex-1 flex-col gap-4">
    <div
      class="flex flex-col gap-2 text-sm bg-gray-zinc-85 dark:bg-black-arsenic p-4 rounded-xl"
    >
      <div class="flex justify-between items-center gap-4">
        <div class="flex-1 flex flex-col gap-2">
          <div class="flex justify-between items-center gap-1">
            <span
              class="uppercase"
              :class="
                getFontSizeStyle(Number(appStore.theme_settings.font_size))
              "
              :style="{
                fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                  .primaryFontClass,
                color: appStore.theme_settings.font_color,
              }"
              >Chain</span
            >
            <div class="flex items-center gap-1">
              <img
                :src="getChainLogoUrl(rpcStore.selectedRPCConfig, 'EVM')"
                class="h-4 w-4"
                @error="handleFallbackLogo"
              />
              <span
                :class="
                  getFontSizeStyle(Number(appStore.theme_settings.font_size))
                "
                :style="{
                  fontFamily: getFontFaimly(
                    appStore.theme_settings.font_pairing
                  ).primaryFontClass,
                  color: appStore.theme_settings.font_color,
                }"
              >
                {{ rpcStore.selectedRPCConfig?.chainName }}
              </span>
            </div>
          </div>
          <div class="flex justify-between items-center gap-1">
            <span
              class="uppercase"
              :class="
                getFontSizeStyle(Number(appStore.theme_settings.font_size))
              "
              :style="{
                fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                  .primaryFontClass,
                color: appStore.theme_settings.font_color,
              }"
              >Interact Contract</span
            >
            <span
              :title="typedData.domain.verifyingContract"
              :class="
                getFontSizeStyle(Number(appStore.theme_settings.font_size))
              "
              :style="{
                fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                  .primaryFontClass,
                color: appStore.theme_settings.font_color,
              }"
            >
              {{ truncateMid(typedData.domain.verifyingContract) }}
            </span>
          </div>
          <div class="flex justify-between items-center gap-1">
            <span
              class="uppercase"
              :class="
                getFontSizeStyle(Number(appStore.theme_settings.font_size))
              "
              :style="{
                fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                  .primaryFontClass,
                color: appStore.theme_settings.font_color,
              }"
              >Operation</span
            >
            <span
              :class="
                getFontSizeStyle(Number(appStore.theme_settings.font_size))
              "
              :style="{
                fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                  .primaryFontClass,
                color: appStore.theme_settings.font_color,
              }"
            >
              {{ typedData.primaryType }}
            </span>
          </div>
          <div class="flex flex-col gap-1">
            <span
              class="uppercase"
              :class="
                getFontSizeStyle(Number(appStore.theme_settings.font_size))
              "
              :style="{
                fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                  .primaryFontClass,
                color: appStore.theme_settings.font_color,
              }"
              >Data</span
            >
            <div
              class="card dark:bg-black-100 h-full p-2 break-word rounded-md overflow-hidden break-words"
            >
              <div class="overflow-auto h-full w-full">
                <VJsonViewer :value="typedData.message"></VJsonViewer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
