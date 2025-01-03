<script setup lang="ts">
import Decimal from 'decimal.js'

import { useAppStore } from '@/store/app'
import useCurrencyStore from '@/store/currencies'
import { truncateMid } from '@/utils/stringUtils'
import { getFontFaimly, getFontSizeStyle } from '@/utils/utilsFunction'

const currencyStore = useCurrencyStore()
const props = defineProps<{ transaction: any }>()
const appStore = useAppStore()

const gasFeesUSD = new Decimal(props.transaction.gasLimit)
  .mul(new Decimal(props.transaction.gasPrice))
  .mul(new Decimal(10).pow(-18))
  .div(currencyStore.currencies['EGLD'])
  .toDecimalPlaces(5)
</script>

<template>
  <div class="flex flex-col gap-2 text-sm">
    <div
      class="uppercase"
      :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
      :style="{
        fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
          .primaryFontClass,
        color: appStore.theme_settings.font_color,
      }"
    >
      Transaction Details
    </div>
    <div
      v-for="[key, value] in Object.entries(props.transaction)"
      :key="key"
      class="flex justify-between gap-4"
    >
      <span
        class="w-[120px] capitalize"
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
        >{{ key }}</span
      >
      <span
        :title="String(value)"
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
      >
        {{
          key === 'sender' || key === 'receiver'
            ? truncateMid(value as string, 8)
            : value
        }}
      </span>
    </div>
    <div class="flex justify-between gap-4 text-base">
      <span
        class="w-[120px] capitalize"
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
        >Gas Fees</span
      >
      <span
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
        >{{ gasFeesUSD }} USD</span
      >
    </div>
  </div>
</template>
