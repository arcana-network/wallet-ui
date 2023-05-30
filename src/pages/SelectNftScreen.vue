<script setup lang="ts">
import { onMounted, ref, type Ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import type { NFT } from '@/models/NFT'
import { NFTDB } from '@/services/nft.service'
import { useModalStore } from '@/store/modal'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import { getDetailedNFTs } from '@/utils/nftUtils'
import { getStorage } from '@/utils/storageWrapper'

type ModalState = 'send-nft' | false

const userStore = useUserStore()
const rpcStore = useRpcStore()
const router = useRouter()
const nfts: Ref<NFT[]> = ref([])
const selectedNft: Ref<NFT | null> = ref(null)
const showModal: Ref<ModalState> = ref(false)
const modalStore = useModalStore()
const searchQuery = ref('')
const filteredNfts: Ref<NFT[]> = ref([])
const storage = getStorage()
let nftDB: NFTDB

async function getNFTAssets() {
  nfts.value = await getDetailedNFTs(nftDB, Number(rpcStore.selectedChainId))
  filteredNfts.value = [...nfts.value]
}

function openNftModal(nft: NFT) {
  modalStore.setShowModal(true)
  showModal.value = 'send-nft'
  selectedNft.value = nft
}

function handleClose() {
  modalStore.setShowModal(false)
  showModal.value = false
}

watch(
  () => searchQuery.value,
  () => {
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase()
      filteredNfts.value = nfts.value.filter(
        (nft) =>
          nft.name.toLowerCase().includes(query) ||
          nft.tokenId.toLowerCase().includes(query) ||
          nft.collectionName.toLowerCase().includes(query)
      )
    } else {
      filteredNfts.value = nfts.value
    }
  }
)

onMounted(async () => {
  nftDB = await NFTDB.create(storage.local, userStore.walletAddress)
  await getNFTAssets()
})

rpcStore.$subscribe(getNFTAssets)
</script>

<template>
  <div>
    <div class="h-full mt-2">
      <div class="wallet__card rounded-[10px] flex flex-col w-full mb-5">
        <div class="flex flex-col gap-5">
          <div class="flex flex-grow gap-2 mx-4 mt-5">
            <img
              src="@/assets/images/arrow-left.svg"
              class="cursor-pointer invert dark:invert-0"
              @click.stop="router.back()"
            />
            <div class="font-semibold flex-grow">Select Artwork</div>
          </div>
          <div v-if="nfts.length" class="space-y-1 px-4">
            <label
              class="text-xs text-zinc-400 font-semibold"
              for="recipientWalletAddress"
            >
              Search Artwork
            </label>
            <input
              id="search-artwork"
              v-model="searchQuery"
              type="text"
              class="text-base p-4 input text-ellipsis overflow-hidden whitespace-nowrap w-full"
              placeholder="Type the name or ID of the artwork"
            />
          </div>
          <div class="flex flex-col divide-y-[1px] divide-gray-600">
            <div
              v-if="nfts.length"
              class="grid grid-cols-2 gap-[10px] pt-5 pb-4 overflow-y-scroll mx-4 mr-[6px]"
            >
              <div
                v-for="nft in filteredNfts"
                :key="`nft-${nft.address}-${nft.tokenId}`"
                class="nft-card rounded cursor-pointer"
                @click.stop="openNftModal(nft)"
              >
                <div
                  class="h-[136px] sm:h-[96px] rounded m-1 bg-center bg-cover"
                  :style="{ 'background-image': `url(${nft.imageUrl})` }"
                ></div>
                <div class="flex flex-col gap-1 p-[10px]">
                  <span
                    class="nft-card-title font-normal overflow-hidden whitespace-nowrap text-ellipsis"
                    :title="nft.name"
                    >{{ nft.name }}</span
                  >
                  <span
                    class="nft-card-collection font-normal overflow-hidden whitespace-nowrap text-ellipsis"
                    :title="nft.collectionName"
                    >{{ nft.collectionName }}</span
                  >
                </div>
              </div>
            </div>
            <div v-else class="flex justify-between p-5">
              <span
                v-if="nfts.length"
                class="color-secondary m-auto font-semibold text-sm sm:text-xs px-4"
                >No NFTs found</span
              >
              <span
                v-else
                class="color-secondary m-auto font-semibold text-sm sm:text-xs px-4"
                >No NFTs added</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
