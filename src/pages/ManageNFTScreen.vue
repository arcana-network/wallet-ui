<script setup lang="ts">
import { onBeforeMount, reactive, ref, type Ref } from 'vue'
import { useRouter } from 'vue-router'

import AppLoader from '@/components/AppLoader.vue'
import { NFT } from '@/models/NFT'
import { NFTDB } from '@/services/nft.service'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import { getImage } from '@/utils/getImage'
import { getStorage } from '@/utils/storageWrapper'

const router = useRouter()
const userStore = useUserStore()
const rpcStore = useRpcStore()

const loader = reactive({
  show: false,
  message: '',
})
const storage = getStorage()

let nftDB: NFTDB
const nfts: Ref<NFT[]> = ref([])

onBeforeMount(async () => {
  nftDB = await NFTDB.create(storage.local, userStore.walletAddress)
  nfts.value = nftDB.getNFTs(Number(rpcStore.selectedChainId))
})

function handleClose() {
  router.back()
}

function handleAddToken() {
  router.push({ name: 'AddNft' })
}

function handleEditToken(nft: NFT) {
  if (!nft.autodetected) {
    router.push({
      name: 'EditNft',
      params: {
        address: nft.address,
        collectionName: nft.collectionName,
        tokenId: nft.tokenId,
      },
    })
  }
}
</script>

<template>
  <div v-if="loader.show" class="flex justify-center items-center flex-1">
    <AppLoader :message="loader.message" />
  </div>
  <div v-else class="flex-grow mb-5">
    <div class="flex flex-1 flex-col min-h-full">
      <div class="flex flex-col items-center min-h-full flex-grow gap-5">
        <h1 class="w-full text-center text-lg font-bold">Manage NFTs</h1>
        <div
          class="card flex flex-col w-full h-full max-h-max text-left flex-grow overflow-hidden"
        >
          <div
            v-if="nfts.length"
            class="flex flex-col flex-grow overflow-y-scroll py-2"
          >
            <div
              v-for="nft in nfts"
              :key="`nft-${nft.address}-${nft.tokenId}`"
              :title="`${nft.collectionName} (${nft.tokenId}) - ${nft.name}`"
              class="select-none flex justify-between text-base px-4 py-2 nft-container"
              :class="{
                'cursor-pointer': !nft.autodetected,
              }"
              @click.stop="handleEditToken(nft)"
            >
              <span class="overflow-hidden whitespace-nowrap text-ellipsis">
                {{ nft.collectionName }} ({{ nft.tokenId }})
              </span>
              <img
                v-if="!nft.autodetected"
                :src="getImage('edit.svg')"
                class="opacity-0"
              />
            </div>
          </div>
          <div v-else class="flex flex-col flex-grow">
            <span
              class="color-secondary m-auto font-semibold text-sm sm:text-xs"
              >No NFTs added</span
            >
          </div>
          <div class="flex justify-center">
            <button
              class="btn-quaternery flex py-1 gap-1 items-center cursor-pointer flex-grow justify-center border-b-0 border-x-0 border-t-1"
              @click.stop="handleAddToken"
            >
              <img :src="getImage('plus.svg')" />
              <span class="text-sm">New</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.nft-container:hover img {
  opacity: 1;
}
</style>
