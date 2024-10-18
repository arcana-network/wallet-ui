<script setup lang="ts">
import { Decimal } from 'decimal.js'
import { onMounted, ref } from 'vue'

import GasPrice from '@/components/GasPrice.vue'
import SignMessageAdvancedInfo from '@/components/signMessageAdvancedInfo.vue'
import { useAppStore } from '@/store/app'
import { getImage } from '@/utils/getImage'
import { getRequestHandler } from '@/utils/requestHandlerSingleton'
import { sanitizeRequest } from '@/utils/sanitizeRequest'
import { useSVGInjector } from '@/utils/useSvgInjector.ts'
import { getFontFaimly, getFontSizeStyle } from '@/utils/utilsFunction'

const props = defineProps({
  request: {
    type: Object,
    required: true,
  },
  chainConfig: {
    type: Object,
    required: true,
  },
  appDetails: {
    type: Object,
    required: true,
  },
})

const emits = defineEmits(['gasPriceInput'])

const baseFee = ref('0')
const gasLimit = ref('0')
const customGasPrice = ref({} as unknown)
const showGasFeeLoader = ref(false)
const showDetails = ref(false)
const appStore = useAppStore()
function calculateValue(value) {
  return new Decimal(value).div(Decimal.pow(10, 18)).toString()
}

function getGasValue(gasPrice) {
  return new Decimal(gasPrice).add(1.5).mul(21000).toHexadecimal()
}

function calculateGasPrice(gasPrice) {
  if (gasPrice !== undefined) {
    return `${new Decimal(getGasValue(gasPrice))
      .div(Decimal.pow(10, 18))
      .toDecimalPlaces(10)
      .toString()} ${props.chainConfig.currency || 'Units'}`
  }
  return 'Unknown'
}

function computeMaxFee(value) {
  return new Decimal(value.maxFeePerGas)
    .add(value.maxPriorityFeePerGas || 0)
    .toString()
}

function handleSetGasPrice(value) {
  customGasPrice.value = value
  emits('gasPriceInput', {
    value: {
      maxFeePerGas: value.maxFeePerGas
        ? new Decimal(computeMaxFee(value))
            .mul(Decimal.pow(10, 9))
            .toHexadecimal()
        : null,
      maxPriorityFeePerGas: value.maxPriorityFeePerGas
        ? new Decimal(value.maxPriorityFeePerGas)
            .mul(Decimal.pow(10, 9))
            .toHexadecimal()
        : null,
      gasLimit: value.gasLimit ? value.gasLimit : null,
    },
  })
}

onMounted(async () => {
  const request = props.request
  showGasFeeLoader.value = true
  try {
    const accountHandler = getRequestHandler().getAccountHandler()
    const baseGasPrice = (
      await accountHandler.provider.getGasPrice()
    ).toString()
    baseFee.value = new Decimal(baseGasPrice).div(Decimal.pow(10, 9)).toString()

    const sanitizedRequest = sanitizeRequest({ ...request })

    gasLimit.value = (
      await accountHandler.provider.estimateGas({
        ...sanitizedRequest.params[0],
      })
    ).toString()

    const maxFeePerGas = request.params[0].maxFeePerGas
    const maxPriorityFeePerGas = request.params[0].maxPriorityFeePerGas

    if (maxFeePerGas) {
      customGasPrice.value.maxFeePerGas = new Decimal(maxFeePerGas)
        .div(Decimal.pow(10, 9))
        .toString()
    } else {
      customGasPrice.value.maxFeePerGas = new Decimal(baseFee.value)
        .add(1.5)
        .toString()
    }

    if (maxPriorityFeePerGas) {
      customGasPrice.value.maxPriorityFeePerGas = new Decimal(
        maxPriorityFeePerGas
      )
        .div(Decimal.pow(10, 9))
        .toString()
    }

    customGasPrice.value.gasLimit = request.params[0].gasLimit || gasLimit.value

    handleSetGasPrice(customGasPrice.value)
  } catch (e) {
    console.log(e)
  } finally {
    showGasFeeLoader.value = false
  }
})

const arrowContainer = ref<HTMLElement | null>(null)

const svgRefs = [arrowContainer]

const { fetchAndInjectSVG } = useSVGInjector(svgRefs)
</script>

<template>
  <div
    class="flex-1 flex flex-col p-2 h-full rounded-md space-y-4 overflow-auto"
  >
    <p
      class="text-center"
      :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
      :style="{
        fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
          .primaryFontClass,
        color: appStore.theme_settings.font_color,
      }"
    >
      The application
      <span
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
        >{{ appDetails?.name }}</span
      >
      is requesting a payment. Do you approve the transaction?
    </p>
    <div
      v-if="request.params[0]?.value"
      class="flex justify-center items-baseline space-x-5"
    >
      <span
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
        >{{ props.chainConfig.currency || 'Units' }}</span
      >
      <span
        class="text-4xl text-white-400"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
        >{{ calculateValue(request.params[0]?.value) }}</span
      >
    </div>
    <div class="text-center">
      <span
        v-if="showGasFeeLoader"
        class="animate-pulse"
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
        >Calculating gas fee.....</span
      >
      <span
        v-else
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
      >
        Additional
        <span
          :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
          :style="{
            fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
              .primaryFontClass,
            color: appStore.theme_settings.font_color,
          }"
          >{{
            calculateGasPrice(
              customGasPrice.maxFeePerGas || request.params[0].gasPrice
            )
          }}</span
        >
        for Transaction Fees
      </span>
    </div>
    <div
      v-if="request.params[0]?.data"
      class="flex flex-col space-y-2"
      :class="{ 'h-2/4': showDetails }"
    >
      <button
        class="flex justify-center items-center text-sm font-medium"
        @click="showDetails = !showDetails"
      >
        <span
          :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
          :style="{
            fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
              .primaryFontClass,
            color: appStore.theme_settings.font_color,
          }"
          >View Details
        </span>
        <div ref="arrowContainer">
          <img
            :src="getImage('arrow-down.svg')"
            class="transition-all duration-500 ease-in-out"
            :class="{ '-rotate-180': showDetails }"
            title="Click to expand"
            alt="Arrow Down Icon"
            @load="(event) => fetchAndInjectSVG(event, 0)"
          />
        </div>
      </button>
      <SignMessageAdvancedInfo
        v-if="showDetails"
        :info="request.params[0]?.data"
      />
    </div>
    <div>
      <GasPrice
        :base-fee="baseFee"
        :gas-limit="gasLimit"
        :max-fee-per-gas="customGasPrice.maxFeePerGas"
        :max-priority-fee-per-gas="customGasPrice.maxPriorityFeePerGas"
        @gas-price-input="handleSetGasPrice"
      />
    </div>
  </div>
</template>
