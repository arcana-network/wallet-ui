<script lang="ts" setup>
import { computed, ref, type ComputedRef, type Ref } from 'vue'
import { useRouter } from 'vue-router'

import SendNft from '@/components/SendNft.vue'
import type { NFTContractType } from '@/models/NFT'
import { useModalStore } from '@/store/modal'

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
}

type NftAttributes = {
  trait: string
  value: string
}

type ModalState = 'send-nft' | false

const props = defineProps<NftDetails>()
const router = useRouter()
const showModal: Ref<ModalState> = ref(false)
const modalStore = useModalStore()

const nftAttributes: ComputedRef<NftAttributes[]> = computed(() => {
  if (props.attributes) {
    return JSON.parse(props.attributes)
  }
  return []
})

function openNftModal() {
  modalStore.setShowModal(true)
  showModal.value = 'send-nft'
}

function handleClose() {
  modalStore.setShowModal(false)
  showModal.value = false
}
</script>

<template>
  <div>
    <div class="h-full mt-2">
      <div class="flex flex-col gap-5">
        <div class="flex flex-grow relative">
          <img
            src="@/assets/images/arrow-left.svg"
            class="cursor-pointer absolute invert dark:invert-0"
            @click.stop="router.back()"
          />
          <div class="font-semibold flex-grow text-center">
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
              v-else
              class="h-[316px] sm:h-[180px] w-full object-cover object-center rounded-[10px] p-[2px]"
              :src="props.imageUrl"
            />
          </div>
          <div class="px-4 my-5">
            <div class="flex justify-between gap-3">
              <div
                class="overflow-hidden whitespace-nowrap text-ellipsis max-w-[16ch] font-semibold nft-title"
                :title="props.name"
              >
                {{ props.name }}
              </div>
              <div class="flex gap-3">
                <img
                  src="@/assets/images/send.svg"
                  class="cursor-pointer invert dark:invert-0"
                  @click.stop="openNftModal"
                />
              </div>
            </div>
            <div class="mt-5 flex flex-col gap-3">
              <div class="font-semibold font-montserrat nft-label">
                Description
              </div>
              <div v-if="props.description" class="nft-description font-normal">
                {{ props.description }}
              </div>
              <span v-else class="nft-description font-normal">
                No description provided
              </span>
            </div>
            <div class="mt-5 flex flex-col gap-3">
              <div class="font-semibold font-montserrat nft-label">
                Attributes
              </div>
              <div v-if="props.attributes?.length" class="flex gap-2 flex-wrap">
                <div
                  v-for="attribute in nftAttributes"
                  :key="`${attribute.trait}-${attribute.value}`"
                  class="nft-attribute-box rounded-[10px] p-2 flex flex-col gap-1"
                  :title="JSON.stringify(attribute)"
                >
                  <div
                    class="nft-attribute-trait font-semibold font-montserrat"
                  >
                    {{ attribute.trait }}
                  </div>
                  <div class="nft-attribute-value">{{ attribute.value }}</div>
                </div>
              </div>
              <div v-else class="nft-description font-normal">
                No attributes provided
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Teleport v-if="showModal" to="#modal-container">
      <SendNft
        v-if="showModal === 'send-nft'"
        :nft="{ ...props, attributes: nftAttributes }"
        @close="handleClose"
      />
    </Teleport>
  </div>
</template>

<style scoped>
.nft-title {
  font-size: var(--fs-500);
}

.nft-label {
  font-size: var(--fs-300);
}

.nft-description,
.nft-attribute-trait {
  font-size: var(--fs-250);
  color: var(--fg-color-secondary);
}

.nft-attribute-value {
  font-size: var(--fs-400);
}

.nft-attribute-box {
  background: var(--debossed-box-color);
}
</style>
