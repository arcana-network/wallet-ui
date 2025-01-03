<script setup lang="ts">
import {
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js'
import base58 from 'bs58'

import { useAppStore } from '@/store/app'
import { getProgramDetails } from '@/utils/solana/getProgramFromId'
import { truncateMid } from '@/utils/stringUtils'
import { getFontFaimly, getFontSizeStyle } from '@/utils/utilsFunction'

const props = defineProps<{ message: string }>()

const decoded = base58.decode(props.message)
const deserialized = VersionedTransaction.deserialize(decoded)
const decompiled = TransactionMessage.decompile(deserialized.message)

const payerKey = decompiled.payerKey.toString()
const instructions = decompiled.instructions
const recentBlockhash = decompiled.recentBlockhash
const appStore = useAppStore()
const displayableInstructions = instructions.map((instruction) => {
  return getProgramDetails(instruction)
})

function getDisplayableValue(value: any) {
  if (value instanceof PublicKey || typeof value === 'bigint') {
    return value.toString()
  } else if (value instanceof Array || typeof value === 'object') {
    return JSON.stringify(value)
  }
  return value
}
</script>

<template>
  <div class="flex flex-col gap-2 text-sm">
    <div class="flex justify-between gap-4">
      <span
        class="w-[120px]"
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
        >Payer</span
      >
      <span
        class="w-[200px] text-right whitespace-nowrap overflow-hidden text-ellipsis"
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
        :title="payerKey"
      >
        {{ truncateMid(payerKey, 8) }}
      </span>
    </div>
    <div class="flex justify-between gap-4">
      <span
        class="w-[120px]"
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
        >Recent Blockhash</span
      >
      <span
        class="w-[200px] text-right whitespace-nowrap overflow-hidden text-ellipsis"
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
        :title="recentBlockhash"
      >
        {{ truncateMid(recentBlockhash, 8) }}
      </span>
    </div>
    <div class="flex flex-col gap-2 mt-4">
      <div
        class="text-sm font-medium"
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
      >
        Instructions
      </div>
      <div class="flex flex-col gap-8">
        <div
          v-for="(instruction, index) in displayableInstructions"
          :key="instruction.program + index"
          class="flex flex-col gap-2 text-sm"
        >
          <div class="text-sm font-medium">#{{ index + 1 }}</div>
          <div class="flex justify-between gap-4">
            <span
              class="w-[120px]"
              :class="
                getFontSizeStyle(Number(appStore.theme_settings.font_size))
              "
              :style="{
                fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                  .primaryFontClass,
                color: appStore.theme_settings.font_color,
              }"
              >Program</span
            >
            <span
              class="w-[200px] text-right whitespace-nowrap overflow-hidden text-ellipsis"
              :title="instruction.program"
            >
              {{ instruction.program }}
            </span>
          </div>
          <div class="flex justify-between gap-4">
            <span class="w-[120px]">Instruction</span>
            <span
              class="w-[200px] text-right whitespace-nowrap overflow-hidden text-ellipsis"
              :title="instruction.type"
              :class="
                getFontSizeStyle(Number(appStore.theme_settings.font_size))
              "
              :style="{
                fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                  .primaryFontClass,
                color: appStore.theme_settings.font_color,
              }"
            >
              {{ instruction.type }}
            </span>
          </div>
          <div
            v-for="[key, value] in Object.entries(instruction.instruction)"
            :key="key"
            class="flex justify-between gap-4"
          >
            <span
              class="w-[120px] capitalize"
              :class="
                getFontSizeStyle(Number(appStore.theme_settings.font_size))
              "
              :style="{
                fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                  .primaryFontClass,
                color: appStore.theme_settings.font_color,
              }"
              >{{ key }}</span
            >
            <span
              class="w-[200px] text-right whitespace-nowrap overflow-hidden text-ellipsis"
              :title="getDisplayableValue(value)"
              :class="
                getFontSizeStyle(Number(appStore.theme_settings.font_size))
              "
              :style="{
                fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                  .primaryFontClass,
                color: appStore.theme_settings.font_color,
              }"
            >
              {{ getDisplayableValue(value) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
