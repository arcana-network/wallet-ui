<script setup lang="ts">
import Decimal from 'decimal.js'
import { computed } from 'vue'

import { useAppStore } from '@/store/app'
import useCurrencyStore from '@/store/currencies'
import { truncateMid } from '@/utils/stringUtils'
import { getFontFaimly, getFontSizeStyle } from '@/utils/utilsFunction'

const props = defineProps<{ transactions: any[] }>()
const currencyStore = useCurrencyStore()
const appStore = useAppStore()
const totalGasFeesUSD = computed(() => {
  return props.transactions
    .reduce((acc: Decimal, transaction: any) => {
      const gasFeeUSD = new Decimal(transaction.gasLimit)
        .mul(new Decimal(transaction.gasPrice))
        .mul(new Decimal(10).pow(-18))
        .div(currencyStore.currencies['EGLD'])
      return acc.add(gasFeeUSD)
    }, new Decimal(0))
    .toDecimalPlaces(5)
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <div
      :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
      :style="{
        fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
          .primaryFontClass,
        color: appStore.theme_settings.font_color,
      }"
    >
      Transactions
    </div>
    <div class="flex flex-col gap-8">
      <div
        v-for="(transaction, index) in props.transactions"
        :key="JSON.stringify(transaction)"
        class="flex flex-col gap-2 text-sm"
      >
        <div class="text-lg">#{{ index + 1 }}</div>
        <div
          v-for="[key, value] in Object.entries(transaction)"
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
        <div class="flex justify-between gap-4">
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
            >{{
              new Decimal(transaction.gasLimit)
                .mul(new Decimal(transaction.gasPrice))
                .mul(new Decimal(10).pow(-18))
                .div(currencyStore.currencies['EGLD'])
                .toDecimalPlaces(5)
            }}
            USD</span
          >
        </div>
      </div>
      <div>
        <div class="flex justify-between gap-4">
          <span
            class="w-[120px] capitalize"
            :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
            :style="{
              fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                .primaryFontClass,
              color: appStore.theme_settings.font_color,
            }"
            >Total Gas Fees</span
          >
          <span
            :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
            :style="{
              fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                .primaryFontClass,
              color: appStore.theme_settings.font_color,
            }"
            >{{ totalGasFeesUSD }} USD</span
          >
        </div>
      </div>
    </div>
  </div>
</template>
