<script setup lang="ts">
import { onMounted, ref, type Ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import SendNft from '@/components/SendNft.vue'
import type { NFT } from '@/models/NFT'
import { useModalStore } from '@/store/modal'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'

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

function fetchStoredNfts(): NFT[] {
  const storedNftsString = localStorage.getItem(
    `${userStore.walletAddress}/${rpcStore.selectedRpcConfig?.chainId}/nfts`
  )
  if (storedNftsString) {
    return (JSON.parse(storedNftsString) as NFT[]).filter(
      (contract) => contract.type === 'erc721' || contract.type === 'erc1155'
    )
  } else {
    return []
  }
}

async function getNFTAssets() {
  nfts.value = []
  const storedNfts = fetchStoredNfts()
  storedNfts.forEach((nft) => {
    nfts.value.push({
      type: nft.type,
      name: nft.name,
      balance: nft.balance,
      imageUrl: nft.imageUrl,
      animationUrl: nft.animationUrl,
      description: nft.description,
      collectionName: nft.collectionName,
      tokenId: nft.tokenId,
      address: nft.address,
      attributes: nft.attributes,
    })
  })
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

onMounted(getNFTAssets)

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
    <Teleport v-if="showModal" to="#modal-container">
      <SendNft
        v-if="showModal === 'send-nft' && selectedNft"
        :nft="selectedNft"
        @close="handleClose"
      />
    </Teleport>
  </div>
</template>