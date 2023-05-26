<script setup lang="ts">
import { onMounted, ref, type Ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'

import type { NFT } from '@/models/NFT'
import { NFTDB } from '@/services/nft.service'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import { getImage } from '@/utils/getImage'
import { getDetailedNFTs } from '@/utils/nftUtils'
import { getStorage } from '@/utils/storageWrapper'

const userStore = useUserStore()
const rpcStore = useRpcStore()
const storage = getStorage()
let nftDB: NFTDB

type NFTViewProps = {
  refreshState?: boolean
}

const props = defineProps<NFTViewProps>()
const emit = defineEmits(['refreshed'])

const router = useRouter()
const nfts: Ref<NFT[]> = ref([])
const loader = reactive({
  show: false,
  message: 'Loading saved NFTs...',
})

async function getNFTAssets() {
  loader.show = true
  nftDB = await NFTDB.create(storage.local, userStore.walletAddress)
  nfts.value = await getDetailedNFTs(nftDB, Number(rpcStore.selectedChainId))

  loader.show = false
}

function handleManageNFT() {
  router.push({ name: 'ManageNft' })
}

function getNftDetailValues(nft: NFT) {
  const attributes = nft.attributes?.length
    ? JSON.stringify(nft.attributes)
    : ''
  const autodetected = JSON.stringify(nft.autodetected)
  return {
    ...nft,
    autodetected,
    attributes,
  }
}

onMounted(getNFTAssets)

rpcStore.$subscribe(getNFTAssets)

watch(
  () => props.refreshState,
  async () => {
    if (props.refreshState) {
      await getNFTAssets()
      emit('refreshed')
    }
  }
)
</script>

<template>
  <div>
    <div class="flex flex-col max-h-80">
      <div
        v-if="loader.show"
        class="flex justify-center items-center flex-1flex p-5"
      >
        <p class="m-auto font-semibold text-sm sm:text-xs px-4">
          {{ loader.message }}
        </p>
      </div>
      <div v-else class="p-3 m-1 overflow-y-scroll">
        <div v-if="nfts.length" class="grid grid-cols-2 gap-[10px]">
          <div
            v-for="nft in nfts"
            :key="`nft-${nft.address}-${nft.tokenId}`"
            class="nft-card rounded cursor-pointer"
            @click.stop="
              router.push({
                name: 'NftDetails',
                params: {
                  ...getNftDetailValues(nft),
                },
              })
            "
          >
            <div
              class="h-[136px] rounded m-1 bg-center bg-cover"
              :style="{ 'background-image': `url(${nft.imageUrl})` }"
            ></div>
            <div class="flex flex-col px-2">
              <span
                class="text-gray-100 text-sm overflow-hidden whitespace-nowrap text-ellipsis"
                :title="nft.name"
                >{{ nft.name }}</span
              >
              <span
                class="text-gray-100 text-xs overflow-hidden whitespace-nowrap text-ellipsis"
                :title="nft.collectionName"
                >{{ nft.collectionName }}</span
              >
            </div>
          </div>
        </div>
        <div v-else class="flex justify-between p-5">
          <span
            class="color-secondary m-auto font-semibold text-sm sm:text-xs px-4"
            >No NFTs added</span
          >
        </div>
      </div>
      <div class="flex justify-center">
        <button
          class="btn-quaternery border-b-0 border-t-1 border-x-0 flex py-1 gap-1 text-sm items-center cursor-pointer flex-grow justify-center"
          @click.stop="handleManageNFT"
        >
          <img :src="getImage('settings.svg')" />
          <span class="assets-view__add-token-text leading-[1]">Manage</span>
        </button>
      </div>
    </div>
  </div>
</template>
