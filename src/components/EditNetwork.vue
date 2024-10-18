<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'vue-toastification'

import { useAppStore } from '@/store/app'
import { useRpcStore } from '@/store/rpc'
import { content, errors } from '@/utils/content'
import { produceProviderFromURLString } from '@/utils/evm/rpcURLToProvider'
import { getRequestHandler } from '@/utils/requestHandlerSingleton'
import { useImage } from '@/utils/useImage'
import { useSVGInjector } from '@/utils/useSvgInjector.ts'
import { getFontFaimly, getFontSizeStyle } from '@/utils/utilsFunction'

const emit = defineEmits(['close'])
const props = defineProps<{
  chainId: number
}>()

const rpcStore = useRpcStore()
const toast = useToast()
const appStore = useAppStore()
const getImage = useImage()
const rpcConfigForEdit = rpcStore.getRpcConfig(Number(props.chainId))

const rpcConfig = ref({
  chainName: rpcConfigForEdit?.chainName,
  chainId: rpcConfigForEdit?.chainId,
  rpcUrl: rpcConfigForEdit?.rpcUrls[0],
  currencySymbol: rpcConfigForEdit?.nativeCurrency?.symbol,
  explorerUrl: rpcConfigForEdit?.blockExplorerUrls?.[0],
})

function isExistingRpcUrl(url: string) {
  const exisitingRpcUrls = rpcStore.rpcConfigList
    .filter((chain) => Number(chain.chainId) !== Number(props.chainId))
    .map((chain) => chain.rpcUrls)
    .flat()

  return exisitingRpcUrls.some((rpcUrl) => {
    return rpcUrl === url
  })
}

function isExistingChainId(chainId: number) {
  return rpcStore.rpcConfigList.some(
    (chain) =>
      Number(chain.chainId) === chainId &&
      Number(chain.chainId) !== Number(props.chainId)
  )
}

async function validateRPCandChainID(rpcUrl, chainId) {
  const provider = produceProviderFromURLString(rpcUrl)
  const { chainId: fetchedChainId } = await provider.getNetwork()
  await provider.destroy()
  return Number(fetchedChainId) === Number(chainId)
}

async function handleSubmit() {
  try {
    const rpcUrl = rpcConfig.value.rpcUrl
    const chainId = rpcConfig.value.chainId
    if (isExistingRpcUrl(rpcUrl as string)) {
      toast.error(content.RPC.INPUT_EXISTS(rpcUrl as string))
    } else if (isExistingChainId(Number(rpcConfig.value.chainId))) {
      toast.error(content.CHAIN_ID.INPUT_EXISTS(chainId as string))
    } else if (!(await validateRPCandChainID(rpcUrl, chainId))) {
      toast(errors.RPC.ERROR)
    } else {
      const payload = {
        chainName: rpcConfig.value.chainName,
        chainId: rpcConfig.value.chainId as string,
        blockExplorerUrls: [rpcConfig.value.explorerUrl as string],
        rpcUrls: [rpcConfig.value.rpcUrl as string],
        favicon: rpcConfigForEdit?.favicon as string,
        isCustom: true,
        nativeCurrency: {
          symbol: rpcConfig.value.currencySymbol as string,
          decimals: 18,
        },
      }
      rpcStore.editNetwork(Number(props.chainId), payload)
      if (
        Number(props.chainId) === Number(rpcStore.selectedRPCConfig.chainId)
      ) {
        rpcStore.setSelectedRPCConfig(payload)
      }
      if (
        Number(props.chainId) === Number(rpcStore.selectedRPCConfig.chainId)
      ) {
        await getRequestHandler().setRpcConfig({
          ...payload,
          chainId: Number(payload.chainId),
        })
      }
      emit('close')
    }
  } catch (e) {
    toast.error(errors.RPC.INVALID)
  }
}

function deleteNetwork() {
  if (Number(rpcStore.selectedRpcConfig.chainId) === Number(props.chainId)) {
    toast.error(content.NETWORK.INPUT_EXISTS)
  } else {
    rpcStore.deleteNetwork(Number(props.chainId))
    emit('close')
  }
}

const trashContainer = ref<HTMLElement | null>(null)

const svgRefs = [trashContainer]

const { fetchAndInjectSVG } = useSVGInjector(svgRefs)
</script>

<template>
  <div class="space-y-3">
    <div class="flex justify-between">
      <p class="text-xl sm:text-sm font-medium">Edit Network</p>
      <button
        v-if="rpcConfigForEdit?.isCustom"
        class="h-auto"
        @click="deleteNetwork"
      >
        <div ref="trashContainer">
          <img
            :src="getImage('trash-icon')"
            alt="Trash Icon"
            @load="(event) => fetchAndInjectSVG(event, 0)"
          />
        </div>
      </button>
    </div>
    <form class="space-y-3 sm:space-y-2" @submit.prevent="handleSubmit">
      <div class="space-y-1">
        <label
          :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
          :style="{
            fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
              .primaryFontClass,
            color: appStore.theme_settings.font_color,
          }"
          for="networkName"
        >
          Network Name
        </label>
        <input
          id="networkName"
          v-model="rpcConfig.chainName"
          required
          type="text"
          class="text-base sm:text-sm bg-gradient w-full p-2 sm:p-1 rounded-lg border-none outline-none"
          placeholder="e.g. Ethereum"
        />
      </div>
      <div class="space-y-1">
        <label
          :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
          :style="{
            fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
              .primaryFontClass,
            color: appStore.theme_settings.font_color,
          }"
          for="rpcUrl"
        >
          RPC URL
        </label>
        <input
          id="rpcUrl"
          v-model="rpcConfig.rpcUrl"
          required
          type="text"
          class="text-base sm:text-sm bg-gradient w-full p-2 sm:p-1 rounded-lg border-none outline-none"
          placeholder="e.g. https://blockchain.dev.arcana.network"
        />
      </div>
      <div class="space-y-1">
        <label
          :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
          :style="{
            fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
              .primaryFontClass,
            color: appStore.theme_settings.font_color,
          }"
          for="currencySymbol"
        >
          Currency Symbol
        </label>
        <input
          id="currencySymbol"
          v-model="rpcConfig.currencySymbol"
          required
          type="text"
          class="text-base sm:text-sm bg-gradient w-full p-2 sm:p-1 rounded-lg border-none outline-none"
          placeholder="e.g. ETH"
        />
      </div>
      <div class="space-y-1">
        <label
          :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
          :style="{
            fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
              .primaryFontClass,
            color: appStore.theme_settings.font_color,
          }"
          for="chainId"
        >
          Chain ID
        </label>
        <input
          id="chainId"
          v-model="rpcConfig.chainId"
          required
          type="text"
          class="text-base sm:text-sm bg-gradient w-full p-2 sm:p-1 rounded-lg border-none outline-none"
          placeholder="e.g. 40404"
        />
      </div>
      <div class="space-y-1">
        <label
          :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
          :style="{
            fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
              .primaryFontClass,
            color: appStore.theme_settings.font_color,
          }"
          for="explorerUrl"
        >
          Explorer URL (Optional)
        </label>
        <input
          id="explorerUrl"
          v-model="rpcConfig.explorerUrl"
          type="text"
          class="text-base sm:text-sm bg-gradient w-full p-2 sm:p-1 rounded-lg border-none outline-none"
          placeholder="e.g. https://explorer.dev.arcana.network/"
        />
      </div>
      <div class="flex justify-between">
        <button
          class="text-sm sm:text-xs rounded-xl border-2 border-black dark:border-white bg-transparent text-black dark:text-white w-36 h-9 sm:w-20 sm:h-8"
          :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
          :style="{
            fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
              .primaryFontClass,
            color: appStore.theme_settings.font_color,
            borderColor: appStore.theme_settings.accent_color,
            backgroundColor: appStore.theme_settings.accent_color,
          }"
          @click.prevent="emit('close')"
        >
          Cancel
        </button>
        <button
          class="rounded-xl dark:bg-white bg-black w-36 h-9 sm:w-20 sm:h-8"
          :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
          :style="{
            fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
              .primaryFontClass,
            color: appStore.theme_settings.font_color,
            borderColor: appStore.theme_settings.accent_color,
            backgroundColor: appStore.theme_settings.accent_color,
          }"
        >
          Save
        </button>
      </div>
    </form>
  </div>
</template>
