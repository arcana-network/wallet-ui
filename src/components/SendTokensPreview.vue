<script setup lang="ts">
import { Decimal } from 'decimal.js'
import { onBeforeMount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import SwipeToAction from '@/components/SwipeToAction.vue'
import { useAppStore } from '@/store/app'
import { useRpcStore } from '@/store/rpc'
import { EVMAccountHandler } from '@/utils/accountHandler'
import { ChainType } from '@/utils/chainType'
import { getImage } from '@/utils/getImage'
import { getRequestHandler } from '@/utils/requestHandlerSingleton'
import { useImage } from '@/utils/useImage'
import { useSVGInjector } from '@/utils/useSvgInjector.ts'
import { getFontFaimly, getFontSizeStyle } from '@/utils/utilsFunction'

const rpcStore = useRpcStore()
const appStore = useAppStore()
const route = useRoute()
const isPermissionRequestPage = route.name === 'PermissionRequest'
const txFees = ref<string | null>('0')
const requestHandler = getRequestHandler()
const getIcon = useImage()

type PreviewData = {
  senderWalletAddress: string
  recipientWalletAddress: string
  amount: string
  gasFee: string
  selectedToken: string
  estimatedGas: string
}

const emits = defineEmits(['close', 'submit'])
const props = defineProps<{ previewData: PreviewData }>()

const loader = ref({
  show: false,
  message: '',
})

const paymasterBalance = ref('0')
const transactionMode = ref('')

onBeforeMount(async () => {
  loader.value.show = true
  if (appStore.chainType === ChainType.evm_secp256k1 && rpcStore.useGasless) {
    const accountHandler =
      requestHandler.getAccountHandler() as EVMAccountHandler
    const result =
      await accountHandler.determineTransactionModeAndPaymasterBalance()
    paymasterBalance.value = new Decimal(result.paymasterBalance.toHexString())
      .div(Decimal.pow(10, accountHandler.decimals))
      .toString()
    transactionMode.value = result.transactionMode
  }
  loader.value.show = false
})

const nativeCurrency =
  appStore.chainType !== ChainType.multiversx_cv25519
    ? rpcStore.nativeCurrency?.symbol
    : 'USD'

onMounted(async () => {
  switch (appStore.chainType) {
    case ChainType.evm_secp256k1:
      txFees.value = new Decimal(props.previewData.gasFee)
        .mul(props.previewData.estimatedGas)
        .toString()
      break
    case ChainType.multiversx_cv25519:
      txFees.value = props.previewData.estimatedGas
      break
    case ChainType.near_cv25519: {
      txFees.value = null
      break
    }
    default:
      break
  }
})

function truncateAddress(address: string) {
  return `${address.slice(0, 5)}....${address.slice(-5)}`
}

const backContainer = ref<HTMLElement | null>(null)

const svgRefs = [backContainer]

const { fetchAndInjectSVG } = useSVGInjector(svgRefs)
</script>

<template>
  <div class="flex flex-col justify-between">
    <div class="flex flex-col gap-7">
      <div
        v-if="!isPermissionRequestPage"
        class="relative flex justify-center items-center"
      >
        <button
          class="absolute left-0"
          title="Click to go back"
          @click.stop="emits('close')"
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
        <span class="text-lg font-medium">Confirm Transfer</span>
      </div>
      <div class="flex justify-between items-end">
        <div class="flex flex-col gap-1">
          <span
            :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
            :style="{
              fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                .primaryFontClass,
              color: appStore.theme_settings.font_color,
            }"
            >Sender’s Address</span
          >
          <span
            :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
            :style="{
              fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                .primaryFontClass,
              color: appStore.theme_settings.font_color,
            }"
          >
            {{ truncateAddress(props.previewData.senderWalletAddress) }}
          </span>
        </div>
        <img :src="getImage('forward-arrow.svg')" class="w-6 h-6" />
        <div class="flex flex-col gap-1">
          <span
            :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
            :style="{
              fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                .primaryFontClass,
              color: appStore.theme_settings.font_color,
            }"
            >Recipient’s Address</span
          >
          <span
            :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
            :style="{
              fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                .primaryFontClass,
              color: appStore.theme_settings.font_color,
            }"
          >
            {{ truncateAddress(props.previewData.recipientWalletAddress) }}
          </span>
        </div>
      </div>
      <div class="flex flex-col gap-5">
        <div class="flex justify-between">
          <span
            :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
            :style="{
              fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                .primaryFontClass,
              color: appStore.theme_settings.font_color,
            }"
            >Send Amount</span
          >
          <span
            :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
            :style="{
              fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                .primaryFontClass,
              color: appStore.theme_settings.font_color,
            }"
            >{{ props.previewData.amount }}
            {{ props.previewData.selectedToken }}</span
          >
        </div>
        <div v-if="txFees" class="flex justify-between">
          <span
            :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
            :style="{
              fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                .primaryFontClass,
              color: appStore.theme_settings.font_color,
            }"
            >Estimated Gas Fees</span
          >
          <span v-if="loader.show" class="text-base"> Loading... </span>
          <span
            v-else-if="
              !loader.show &&
              (transactionMode === 'SCW' || transactionMode === 'ARCANA')
            "
            class="text-green-100"
            :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
            :style="{
              fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                .primaryFontClass,
            }"
          >
            Sponsored
          </span>
          <span
            v-else-if="
              !loader.show &&
              (transactionMode.length === 0 || !rpcStore.useGasless)
            "
            :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
            :style="{
              fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                .primaryFontClass,
              color: appStore.theme_settings.font_color,
            }"
            >{{ txFees }} {{ nativeCurrency }}</span
          >
        </div>
      </div>
      <span
        v-if="
          !loader.show &&
          (transactionMode === 'SCW' || transactionMode === 'ARCANA')
        "
        class="text-green-100 font-medium text-center w-full"
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
        >This is a Gasless Transaction. Click Below to Approve.
      </span>
      <div
        v-else-if="
          !loader.show && transactionMode.length === 0 && rpcStore.useGasless
        "
        class="flex space-x-2 bg-blue-dark-sky p-2 rounded-sm mt-2"
      >
        <img
          class="w-4 h-4 mt-1"
          :src="getIcon('info-circle', undefined, 'svg')"
        />
        <p
          class="text-left"
          :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
          :style="{
            fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
              .primaryFontClass,
            color: appStore.theme_settings.font_color,
          }"
        >
          Limit exceeded for gasless transactions. You will be charged for this
          transaction.
        </p>
      </div>
    </div>
    <SwipeToAction
      v-if="!isPermissionRequestPage"
      @approve="emits('submit')"
      @reject="emits('close')"
    />
  </div>
</template>
