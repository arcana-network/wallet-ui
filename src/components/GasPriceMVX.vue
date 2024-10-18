<script setup lang="ts">
import { computed } from 'vue'

import { useAppStore } from '@/store/app'
import { getFontFaimly, getFontSizeStyle } from '@/utils/utilsFunction'

const emits = defineEmits(['gasLimitInput'])

const props = defineProps<{
  gasFee: number | string
  gasLimit: number | string
  minGasLimit: number | string
}>()

function onGasLimitChange(event: Event) {
  const target = event.target as HTMLInputElement
  const value = target.value
  emits('gasLimitInput', value)
}
const appStore = useAppStore()
const gasLimit = computed(() => props.gasLimit)
</script>

<template>
  <div class="space-y-2">
    <div class="flex flex-row gap-1">
      <span
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
        >Gas Fee :</span
      >
      <span
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
        >{{ props.gasFee }} USD</span
      >
    </div>
    <div class="flex flex-col gap-1">
      <div class="text-sm font-medium flex justify-between">
        <label
          for="gas-limit"
          :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
          :style="{
            fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
              .primaryFontClass,
            color: appStore.theme_settings.font_color,
          }"
          >Gas Limit</label
        >
        <p
          :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
          :style="{
            fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
              .primaryFontClass,
            color: appStore.theme_settings.font_color,
          }"
        >
          Min Gas Limit: {{ minGasLimit }}
        </p>
      </div>
      <div class="flex justify-between space-x-2">
        <input
          id="gas-limit"
          :value="gasLimit"
          type="number"
          class="input-field flex-1"
          @input="onGasLimitChange"
        />
      </div>
    </div>
  </div>
</template>
