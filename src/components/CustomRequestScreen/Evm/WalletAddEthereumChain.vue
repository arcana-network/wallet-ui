<script setup lang="ts">
import Decimal from 'decimal.js'
import { computed } from 'vue'

import { useAppStore } from '@/store/app'
import { getFontFaimly, getFontSizeStyle } from '@/utils/utilsFunction'

const props = defineProps({
  params: {
    type: Object,
    required: true,
  },
})
const appStore = useAppStore()
const chainId = computed(() => new Decimal(props.params.chainId).toString())
</script>

<template>
  <div class="flex flex-col gap-2">
    <div
      :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
      :style="{
        fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
          .primaryFontClass,
        color: appStore.theme_settings.font_color,
      }"
    >
      Chain Details
    </div>
    <div v-if="props.params?.chainId" class="flex justify-between gap-4">
      <span
        class="w-[120px]"
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
        >Chain Id</span
      >
      <span
        class="w-[200px] text-right whitespace-nowrap overflow-hidden text-ellipsis"
        :title="chainId"
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
      >
        {{ chainId }}
      </span>
    </div>
    <div v-if="props.params?.chainName" class="flex justify-between gap-4">
      <span
        class="w-[120px]"
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
        >Name</span
      >
      <span
        class="w-[200px] text-right flex gap-1 items-center justify-end"
        :title="props.params?.chainName"
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
      >
        <img
          v-if="props.params.iconUrls?.length"
          :src="props.params.iconUrls[0]"
          class="h-4 w-4"
          :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
          :style="{
            fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
              .primaryFontClass,
            color: appStore.theme_settings.font_color,
          }"
        />
        <span class="whitespace-nowrap overflow-hidden text-ellipsis">{{
          props.params.chainName
        }}</span>
      </span>
    </div>
    <div
      v-if="props.params?.nativeCurrency?.symbol"
      class="flex justify-between gap-4"
    >
      <span
        class="w-[120px]"
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
        >Currency</span
      >
      <span
        class="w-[200px] text-right whitespace-nowrap overflow-hidden text-ellipsis"
        :title="props.params.nativeCurrency.symbol"
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
        >{{ props.params.nativeCurrency.symbol }}</span
      >
    </div>
    <div
      v-if="props.params?.rpcUrls?.length"
      class="flex justify-between gap-4"
    >
      <span
        class="w-[120px]"
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
        >RPC</span
      >
      <span
        class="w-[200px] text-right whitespace-nowrap overflow-hidden text-ellipsis"
        :title="props.params.rpcUrls.join(', ')"
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
        >{{ props.params.rpcUrls[0] }}</span
      >
    </div>
    <div
      v-if="props.params?.blockExplorerUrls?.length"
      class="flex justify-between gap-4"
    >
      <span
        class="w-[120px]"
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
        >Explorer</span
      >
      <span
        class="w-[200px] text-right whitespace-nowrap overflow-hidden text-ellipsis"
        :title="props.params.blockExplorerUrls.join(', ')"
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
        >{{ props.params.blockExplorerUrls[0] }}</span
      >
    </div>
  </div>
</template>
