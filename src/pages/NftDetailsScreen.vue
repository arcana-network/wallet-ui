<script lang="ts" setup>
import { computed, ref, type ComputedRef, type Ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import type { NFTContractType } from '@/models/NFT'
import { useModalStore } from '@/store/modal'
import { useRpcStore } from '@/store/rpc'
import { getImage } from '@/utils/getImage'

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
}

type NftAttributes = {
  trait_type: string
  value: string
}

type ModalState = 'send-nft' | false

const router = useRouter()
const route = useRoute()
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
  router.push({ name: 'SendNfts', params: { ...props } })
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
            class="font-semibold flex-grow text-center text-ellipsis overflow-hidden whitespace-nowrap"
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
                class="overflow-hidden whitespace-nowrap text-ellipsis max-w-[16ch] font-semibold text-xl font-bold"
                :title="props.name"
              >
                {{ props.name }}
              </div>
              <div class="flex gap-1">
                <button
                  title="Click to transfer this NFT"
                  @click.stop="openNftModal"
                >
                  <img :src="getImage('send.svg')" />
                </button>
              </div>
            </div>
            <div class="mt-5 flex flex-col gap-1">
              <div class="font-bold text-sm">Description</div>
              <div
                v-if="props.description"
                class="text-xs text-gray-100 font-normal"
              >
                {{ props.description }}
              </div>
              <span v-else class="text-xs text-gray-100 font-normal">
                No description provided
              </span>
            </div>
            <div class="mt-5 flex flex-col gap-1">
              <div class="font-bold text-sm">Attributes</div>
              <div v-if="props.attributes?.length" class="flex gap-2 flex-wrap">
                <div
                  v-for="attribute in nftAttributes"
                  :key="`${attribute.trait_type}-${attribute.value}`"
                  class="rounded-lg py-2 px-3 flex flex-col border border-solid border-gray-200 dark:bg-gray-200"
                  :title="JSON.stringify(attribute)"
                >
                  <div class="text-xs text-gray-100 font-normal">
                    {{ attribute.trait_type }}
                  </div>
                  <div class="font-medium text-sm">
                    {{ attribute.value }}
                  </div>
                </div>
              </div>
              <div v-else class="text-xs text-gray-100 font-normal">
                No attributes provided
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
