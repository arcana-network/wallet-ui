<script setup lang="ts">
import { onMounted, ref, type Ref, reactive, watch, computed } from 'vue'
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
const searchTerm = ref('')

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
  nftDB = await NFTDB.create(storage.local, userStore.walletAddress, true)
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

const filteredNFTs = computed(() => {
  return nfts.value.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      item.tokenId.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
})

function handleFallbackNft(event) {
  event.target.src = getImage('blockchain-icon.png')
}
</script>

<template>
  <div class="space-y-3">
    <div v-if="!loader.show && nfts.length" class="flex flex-col space-y-1">
      <label for="search-nft" class="text-sm">Search NFT</label>
      <div class="card flex px-3 space-x-2">
        <img :src="getImage('search.svg')" alt="search" />
        <input
          id="search-nft"
          v-model="searchTerm"
          class="w-full py-3 px-0"
          placeholder="Type the name or ID of the NFT"
        />
      </div>
    </div>
    <div class="card flex flex-col max-h-96">
      <div
        v-if="loader.show"
        class="flex justify-center items-center flex-1 p-3 m-1"
      >
        <p class="text-sm font-bold">
          {{ loader.message }}
        </p>
      </div>
      <div v-else class="p-3 m-1 overflow-y-auto">
        <div v-if="nfts.length" class="grid grid-cols-2 gap-[10px]">
          <div
            v-for="nft in filteredNFTs"
            :key="`nft-${nft.address}-${nft.tokenId}`"
            class="nft-card rounded cursor-pointer"
            @click.stop="
              router.push({
                name: 'NftDetails',
                query: {
                  ...getNftDetailValues(nft),
                },
              })
            "
          >
            <div class="h-[136px] rounded m-1 overflow-hidden">
              <img
                class="h-full w-full object-cover object-center"
                :src="nft.imageUrl || getImage('blockchain-icon.png')"
                @error="handleFallbackNft"
              />
            </div>
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
        <div v-else class="flex justify-between">
          <span class="color-secondary m-auto font-bold text-sm"
            >No NFTs added</span
          >
        </div>
      </div>
      <div class="flex justify-center">
        <button
          class="btn-quaternery border-b-0 border-t-1 border-x-0 flex py-1 gap-1 text-sm items-center cursor-pointer flex-grow justify-center rounded-b-md"
          @click.stop="handleManageNFT"
        >
          <img :src="getImage('settings.svg')" />
          <span class="text-sm">Manage</span>
        </button>
      </div>
    </div>
  </div>
</template>
