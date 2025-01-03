<script setup lang="ts">
import Decimal from 'decimal.js'
import { type SignAndSendTransactionOptions } from 'near-api-js/lib/account'
import { computed } from 'vue'

import SignMessageAdvancedInfo from '@/components/signMessageAdvancedInfo.vue'
import { useAppStore } from '@/store/app'
import { estimatedNearTxFees } from '@/utils/near/estimatedTxFees'
import { getActionName } from '@/utils/near/getActionName'
import { getRequestHandler } from '@/utils/requestHandlerSingleton'
import { truncateMid } from '@/utils/stringUtils'
import { getFontFaimly, getFontSizeStyle } from '@/utils/utilsFunction'

const props = defineProps<{
  transaction: SignAndSendTransactionOptions
}>()

const accountHander = getRequestHandler().getAccountHandler()
const nearDecimals = accountHander.decimals
const appStore = useAppStore()

const estimatedTxFees = computed(() => {
  const totalTxFees = props.transaction.actions.reduce((acc, action) => {
    for (let key in action) {
      acc = new Decimal(acc)
        .add(new Decimal(estimatedNearTxFees[key] || 0))
        .toNumber()
    }
    return acc
  }, 0)
  return totalTxFees || 0
})
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
    <div class="flex justify-between gap-4">
      <span
        class="w-[120px]"
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
        >Receiver</span
      >
      <span
        class="w-[200px] text-right whitespace-nowrap overflow-hidden text-ellipsis"
        :title="props.transaction.receiverId"
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
      >
        {{ truncateMid(props.transaction.receiverId, 8) }}
      </span>
    </div>
    <div class="flex justify-between gap-4">
      <span
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
        >Estimated Transaction Fees</span
      >
      <span
        class="w-[200px] text-right whitespace-nowrap overflow-hidden text-ellipsis"
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
      >
        {{ estimatedTxFees }} NEAR
      </span>
    </div>
    <div v-if="props.transaction.actions.length > 1">
      <div
        class="mt-4"
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
      >
        Batched Transactions
      </div>
    </div>
    <div
      v-for="(action, index) in props.transaction.actions"
      :key="`near-transaction-${index}`"
    >
      <div v-if="props.transaction.actions.length > 1">
        <div class="flex justify-between gap-4 mt-2">
          <span
            class="w-full"
            :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
            :style="{
              fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                .primaryFontClass,
              color: appStore.theme_settings.font_color,
            }"
            >{{ index + 1 }}) {{ getActionName(action) }}</span
          >
        </div>
      </div>
      <div v-else>
        <div class="flex justify-between gap-4 mt-2 font-medium">
          <span
            class="w-full"
            :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
            :style="{
              fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                .primaryFontClass,
              color: appStore.theme_settings.font_color,
            }"
            >{{ getActionName(action) }}</span
          >
        </div>
      </div>
      <div :class="{ 'ml-3': props.transaction.actions.length > 1 }">
        <div v-if="action.transfer">
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
              >Amount</span
            >
            <span
              class="w-[200px] text-right whitespace-nowrap overflow-hidden text-ellipsis"
              :class="
                getFontSizeStyle(Number(appStore.theme_settings.font_size))
              "
              :style="{
                fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                  .primaryFontClass,
                color: appStore.theme_settings.font_color,
              }"
            >
              {{
                new Decimal(action.transfer.deposit?.toString() || '0')
                  .div(Decimal.pow(10, nearDecimals))
                  .toDecimalPlaces(nearDecimals / 2)
              }}
              NEAR
            </span>
          </div>
        </div>
        <div v-else-if="action.deployContract">
          <SignMessageAdvancedInfo :info="action.deployContract.code" />
        </div>
        <div v-else-if="action.stake" class="flex flex-col gap-1">
          <div class="flex justify-between gap-3">
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
              >Stake Amount</span
            >
            <span
              class="w-[200px] text-right whitespace-nowrap overflow-hidden text-ellipsis"
              :class="
                getFontSizeStyle(Number(appStore.theme_settings.font_size))
              "
              :style="{
                fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                  .primaryFontClass,
                color: appStore.theme_settings.font_color,
              }"
            >
              {{
                new Decimal(action.stake.stake?.toString() || '0')
                  .div(Decimal.pow(10, nearDecimals))
                  .toDecimalPlaces(nearDecimals / 2)
              }}
              NEAR
            </span>
          </div>
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
              >Public Key</span
            >
            <span
              class="w-[200px] text-right whitespace-nowrap overflow-hidden text-ellipsis"
              :class="
                getFontSizeStyle(Number(appStore.theme_settings.font_size))
              "
              :style="{
                fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                  .primaryFontClass,
                color: appStore.theme_settings.font_color,
              }"
            >
              {{ action.stake.publicKey?.toString() }}
            </span>
          </div>
        </div>
        <div v-else-if="action.functionCall" class="flex flex-col gap-1">
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
              >Method</span
            >
            <span
              class="w-[200px] text-right whitespace-nowrap overflow-hidden text-ellipsis"
              :class="
                getFontSizeStyle(Number(appStore.theme_settings.font_size))
              "
              :style="{
                fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                  .primaryFontClass,
                color: appStore.theme_settings.font_color,
              }"
            >
              {{ action.functionCall.methodName }}
            </span>
          </div>
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
              >Deposit</span
            >
            <span
              class="w-[200px] text-right whitespace-nowrap overflow-hidden text-ellipsis"
              :class="
                getFontSizeStyle(Number(appStore.theme_settings.font_size))
              "
              :style="{
                fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                  .primaryFontClass,
                color: appStore.theme_settings.font_color,
              }"
            >
              {{
                new Decimal(action.functionCall.deposit?.toString() || '0')
                  .div(Decimal.pow(10, nearDecimals))
                  .toDecimalPlaces(12)
              }}
              NEAR
            </span>
          </div>
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
              >Gas</span
            >
            <span
              class="w-[200px] text-right whitespace-nowrap overflow-hidden text-ellipsis"
              :class="
                getFontSizeStyle(Number(appStore.theme_settings.font_size))
              "
              :style="{
                fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                  .primaryFontClass,
                color: appStore.theme_settings.font_color,
              }"
            >
              {{ action.functionCall.gas?.toString() }}
            </span>
          </div>
          <div class="flex flex-col gap-1">
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
              >Arguments</span
            >
            <SignMessageAdvancedInfo
              :info="action.functionCall.args.toString()"
            />
          </div>
        </div>
        <div v-else>
          <SignMessageAdvancedInfo :info="action" />
        </div>
      </div>
    </div>
  </div>
</template>
