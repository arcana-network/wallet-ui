<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'

import { NFT } from '@/models/NFT'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import { useImage } from '@/utils/useImage'

const router = useRouter()
const userStore = useUserStore()
const rpcStore = useRpcStore()
const getImage = useImage()

const loader = reactive({
  show: false,
  message: '',
})

const storedNftsString = localStorage.getItem(
  `${userStore.walletAddress}/${rpcStore.selectedRpcConfig?.chainId}/nfts`
)

const nfts: NFT[] = storedNftsString?.length ? JSON.parse(storedNftsString) : []

function handleClose() {
  router.back()
}

function handleAddToken() {
  router.push({ name: 'AddNft' })
}
</script>

<template>
  <div v-if="loader.show" class="flex justify-center items-center flex-1">
    <p class="sm:text-xs">{{ loader.message }}</p>
  </div>
  <div v-else class="flex-grow">
    <div class="wallet__card rounded-[10px] flex flex-1 flex-col min-h-full">
      <div
        class="flex flex-col items-center min-h-full p-4 sm:p-2 space-y-5 sm:space-y-2 flex-grow"
      >
        <h1 class="home__title w-full text-left font-semibold">Manage NFTs</h1>
        <div
          class="home__body-container flex flex-col w-full h-full max-h-[440px] text-left p-2 debossed-card flex-grow divide-y-[1px] divide-gray-400 dark:divide-gray-800"
        >
          <div
            v-if="nfts.length"
            class="flex flex-col flex-grow overflow-y-scroll -mr-[6px]"
          >
            <div
              v-for="nft in nfts"
              :key="`nft-${nft.address}-${nft.tokenId}`"
              :title="`${nft.collectionName} (${nft.tokenId}) - ${nft.name}`"
              class="cursor-pointer select-none p-3 rounded-[10px] flex justify-between gap-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white nft-container"
              @click.stop="
                router.push({
                  name: 'EditNft',
                  params: {
                    address: nft.address,
                    collectionName: nft.collectionName,
                    tokenId: nft.tokenId,
                  },
                })
              "
            >
              <span class="overflow-hidden whitespace-nowrap text-ellipsis">
                {{ nft.collectionName }} ({{ nft.tokenId }})
              </span>
              <img :src="getImage('edit-icon')" class="opacity-0" />
            </div>
          </div>
          <div v-else class="flex flex-col flex-grow">
            <span
              class="color-secondary m-auto font-semibold text-sm sm:text-xs"
              >No NFTs added</span
            >
          </div>
          <div class="flex justify-center">
            <div
              class="flex py-2 mt-2 gap-2 items-center cursor-pointer"
              @click.stop="handleAddToken"
            >
              <img
                src="@/assets/images/plus.svg"
                class="invert dark:invert-0"
              />
              <span class="assets-view__add-token-text leading-[1]">New</span>
            </div>
          </div>
        </div>
        <div class="flex w-full text-sm sm:text-xs justify-center">
          <button
            class="text-sm sm:text-xs rounded-xl font-semibold text-black border-black border-2 dark:text-white dark:border-white w-full h-10 sm:h-8 uppercase"
            @click="handleClose"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.home__title {
  font-size: var(--fs-500);
}

.home__body-container {
  color: var(--fg-color);
  border-radius: 10px;
}

.home__body-content-label {
  font-size: var(--fs-300);
  font-weight: 600;
  color: var(--fg-color-secondary);
}

.home__body-content-value {
  display: flex;
  align-items: center;
  font-size: var(--fs-400);
  font-weight: 400;
}

.home__footer-button-outline {
  color: var(--outlined-button-fg-color);
  border-color: var(--outlined-button-border-color);
}

.home__footer-button-filled {
  flex: 1;
  color: var(--filled-button-fg-color);
  background-color: var(--filled-button-bg-color);
  border-radius: 10px;
}

.nft-container:hover img {
  opacity: 1;
}
</style>
