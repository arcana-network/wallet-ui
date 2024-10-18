<script setup lang="ts">
import Decimal from 'decimal.js'
import { computed } from 'vue'

import { getChainLogoUrl } from '@/services/chainlist.service'
import { useAppStore } from '@/store/app'
import { useRpcStore } from '@/store/rpc'
import { ChainType } from '@/utils/chainType'
import { getImage } from '@/utils/getImage'
import { getFontFaimly, getFontSizeStyle } from '@/utils/utilsFunction'

const props = defineProps({
  params: {
    type: Object,
    required: true,
  },
})

const rpcStore = useRpcStore()
const appStore = useAppStore()

const chainId = computed(() => new Decimal(props.params.chainId).toString())

const chain = computed(() =>
  rpcStore.rpcConfigList.find(
    (chain) => Number(chain.chainId) === Number(props.params.chainId)
  )
)

function handleFallbackLogo(event) {
  event.target.src = getImage('blockchain-icon.png')
}
</script>

<template>
  <div class="flex flex-col gap-2 text-sm">
    <div class="text-sm font-medium">Chain Details</div>
    <div v-if="chainId" class="flex justify-between gap-4">
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
    <div v-if="chain?.chainName" class="flex justify-between gap-4">
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
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
        :title="chain.chainName"
      >
        <img
          :src="
            getChainLogoUrl(
              chain,
              appStore.chainType === ChainType.evm_secp256k1 ? 'EVM' : 'solana'
            )
          "
          class="h-4 w-4"
          @error="handleFallbackLogo"
        />
        <span
          class="whitespace-nowrap overflow-hidden text-ellipsis"
          :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
          :style="{
            fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
              .primaryFontClass,
            color: appStore.theme_settings.font_color,
          }"
          >{{ chain.chainName }}</span
        >
      </span>
    </div>
    <div
      v-if="chain?.nativeCurrency?.symbol"
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
        :title="chain.nativeCurrency.symbol"
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
        >{{ chain.nativeCurrency.symbol }}</span
      >
    </div>
    <div v-if="chain?.rpcUrls?.length" class="flex justify-between gap-4">
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
        :title="chain.rpcUrls.join(', ')"
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
        >{{ chain.rpcUrls[0] }}</span
      >
    </div>
  </div>
</template>
