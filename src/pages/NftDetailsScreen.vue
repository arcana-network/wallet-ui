<script lang="ts" setup>
import { computed, ref, type ComputedRef, type Ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import type { NFTContractType } from '@/models/NFT'
import { useAppStore } from '@/store/app'
import { useModalStore } from '@/store/modal'
import { useRpcStore } from '@/store/rpc'
import { getImage } from '@/utils/getImage'
import { useSVGInjector } from '@/utils/useSvgInjector.ts'
import { getFontFaimly, getFontSizeStyle } from '@/utils/utilsFunction'

type NftDetails = {
  type: NFTContractType
  address: string
  tokenId: string
  collectionName: string
  name: string
  description?: string
  imageUrl: string
  animationUrl?: string
  attributes?: string
  balance?: string
  identifier?: string
}

type NftAttributes = {
  trait_type: string
  value: string
}

type ModalState = 'send-nft' | false

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const showModal: Ref<ModalState> = ref(false)
const modalStore = useModalStore()

const props = route.query as NftDetails
const rpcStore = useRpcStore()

const nftAttributes: ComputedRef<NftAttributes[]> = computed(() => {
  if (props.attributes) {
    return JSON.parse(props.attributes)
  }
  return []
})

function openNftModal() {
  router.push({ name: 'SendNfts', query: props })
}

function handleClose() {
  modalStore.setShowModal(false)
  showModal.value = false
}

watch(
  () => rpcStore.selectedChainId,
  () => {
    router.replace({ name: 'Nfts' })
  }
)

const sendContainer = ref<HTMLElement | null>(null)

const svgRefs = [sendContainer]

const { fetchAndInjectSVG } = useSVGInjector(svgRefs)
</script>

<template>
  <div>
    <div class="h-full mt-2">
      <div class="flex flex-col gap-5">
        <div class="flex flex-grow items-center gap-4">
          <img
            src="@/assets/images/arrow-left.svg"
            class="cursor-pointer invert dark:invert-0"
            @click.stop="router.back()"
          />
          <div
            class="flex-grow text-center text-ellipsis overflow-hidden whitespace-nowrap"
            :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
            :style="{
              fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                .primaryFontClass,
              color: appStore.theme_settings.font_color,
            }"
          >
            {{ props.collectionName }}
          </div>
        </div>
        <div class="wallet__card rounded-[10px] flex flex-col w-full mb-5">
          <div class="relative">
            <video
              v-if="props.animationUrl"
              class="h-[316px] sm:h-[180px] w-full object-cover object-center rounded-[10px] p-[2px]"
              :poster="props.imageUrl"
              controls
            >
              <source :src="props.animationUrl" />
              <p>
                Your browser doesn't support HTML audio/ video. Here is a
                <a :href="props.animationUrl" target="_blank"
                  >link to the media</a
                >
                instead.
              </p>
            </video>
            <img
              v-else-if="props.imageUrl"
              class="h-[316px] sm:h-[180px] w-full object-cover object-center rounded-[10px] p-[2px]"
              :src="props.imageUrl"
            />
          </div>
          <div class="px-4 my-5">
            <div class="flex justify-between gap-3">
              <div
                class="overflow-hidden whitespace-nowrap text-ellipsis max-w-[16ch] font-medium text-xl"
                :title="props.name"
                :class="
                  getFontSizeStyle(Number(appStore.theme_settings.font_size))
                "
                :style="{
                  fontFamily: getFontFaimly(
                    appStore.theme_settings.font_pairing
                  ).primaryFontClass,
                  color: appStore.theme_settings.font_color,
                }"
              >
                {{ props.name }}
              </div>
              <div class="flex gap-1">
                <button
                  title="Click to transfer this NFT"
                  @click.stop="openNftModal"
                >
                  <div ref="sendContainer">
                    <img
                      :src="getImage('send.svg')"
                      alt="Send Icon"
                      @load="(event) => fetchAndInjectSVG(event, 0)"
                    />
                  </div>
                </button>
              </div>
            </div>
            <div class="mt-5 flex flex-col gap-1">
              <div
                :class="
                  getFontSizeStyle(Number(appStore.theme_settings.font_size))
                "
                :style="{
                  fontFamily: getFontFaimly(
                    appStore.theme_settings.font_pairing
                  ).primaryFontClass,
                  color: appStore.theme_settings.font_color,
                }"
              >
                Description
              </div>
              <div
                v-if="props.description"
                :class="
                  getFontSizeStyle(Number(appStore.theme_settings.font_size))
                "
                :style="{
                  fontFamily: getFontFaimly(
                    appStore.theme_settings.font_pairing
                  ).primaryFontClass,
                  color: appStore.theme_settings.font_color,
                }"
              >
                {{ props.description }}
              </div>
              <span
                v-else
                :class="
                  getFontSizeStyle(Number(appStore.theme_settings.font_size))
                "
                :style="{
                  fontFamily: getFontFaimly(
                    appStore.theme_settings.font_pairing
                  ).primaryFontClass,
                  color: appStore.theme_settings.font_color,
                }"
              >
                No description provided
              </span>
            </div>
            <div class="mt-5 flex flex-col gap-1">
              <div
                :class="
                  getFontSizeStyle(Number(appStore.theme_settings.font_size))
                "
                :style="{
                  fontFamily: getFontFaimly(
                    appStore.theme_settings.font_pairing
                  ).primaryFontClass,
                  color: appStore.theme_settings.font_color,
                }"
              >
                Attributes
              </div>
              <div v-if="props.attributes?.length" class="flex gap-2 flex-wrap">
                <div
                  v-for="attribute in nftAttributes"
                  :key="`${attribute.trait_type}-${attribute.value}`"
                  class="rounded-lg py-2 px-3 flex flex-col border border-solid border-gray-200 dark:bg-gray-200"
                  :title="JSON.stringify(attribute)"
                >
                  <div
                    :class="
                      getFontSizeStyle(
                        Number(appStore.theme_settings.font_size)
                      )
                    "
                    :style="{
                      fontFamily: getFontFaimly(
                        appStore.theme_settings.font_pairing
                      ).primaryFontClass,
                      color: appStore.theme_settings.font_color,
                    }"
                  >
                    {{ attribute.trait_type }}
                  </div>
                  <div
                    :class="
                      getFontSizeStyle(
                        Number(appStore.theme_settings.font_size)
                      )
                    "
                    :style="{
                      fontFamily: getFontFaimly(
                        appStore.theme_settings.font_pairing
                      ).primaryFontClass,
                      color: appStore.theme_settings.font_color,
                    }"
                  >
                    {{ attribute.value }}
                  </div>
                </div>
              </div>
              <div
                v-else
                :class="
                  getFontSizeStyle(Number(appStore.theme_settings.font_size))
                "
                :style="{
                  fontFamily: getFontFaimly(
                    appStore.theme_settings.font_pairing
                  ).primaryFontClass,
                  color: appStore.theme_settings.font_color,
                }"
              >
                No attributes provided
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
