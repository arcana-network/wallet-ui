<script setup lang="ts">
import { onMounted, ref, type Ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'

import type { NFT } from '@/models/NFT'
import { getNFTDetails, modifyIpfsUrl } from '@/services/getNFTDetails.service'
import { NFTDB } from '@/services/nft.service'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import { checkOwnership } from '@/utils/nftUtils'
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

function sanitizeUrl(url?: string) {
  if (url && url.startsWith('ipfs://')) {
    return modifyIpfsUrl(url)
  }
  return url
}

async function getNFTAssets() {
  loader.show = true
  nftDB = await NFTDB.create(storage.local, userStore.walletAddress)
  nfts.value = []

  const potentialNFTList = nftDB.getNFTs(Number(rpcStore.selectedChainId))
  const chainId = Number(rpcStore.selectedChainId)

  await Promise.all(
    potentialNFTList.map(async (nft) => {
      let _ownershipPromise:
        | Promise<{ owner: boolean; balance: number }>
        | undefined = undefined
      if (!nft.autodetected) {
        _ownershipPromise = checkOwnership(nft.type, {
          tokenId: nft.tokenId,
          contractAddress: nft.address,
        })
      }

      const [ownership, details] = await Promise.all([
        _ownershipPromise,
        getNFTDetails(nft.tokenUrl, nft.tokenId),
      ])
      if (ownership != undefined && !ownership.owner) {
        nftDB.removeNFT(nft, chainId)
        return
      }

      details.name = details.name || `#${nft.tokenId}`
      details.imageUrl = sanitizeUrl(details.image_url || details.image)
      details.animationUrl = sanitizeUrl(
        details.animation_url || details.animations
      )
      nfts.value.push(details)
    })
  )
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
    <div class="flex flex-col divide-y-[1px] max-h-72 divide-gray-600">
      <div
        v-if="loader.show"
        class="flex justify-center items-center flex-1flex p-5"
      >
        <p class="m-auto font-semibold text-sm sm:text-xs px-4">
          {{ loader.message }}
        </p>
      </div>
      <div v-else class="overflow-y-scroll">
        <div
          v-if="nfts.length"
          class="grid grid-cols-2 gap-[10px] pt-5 pb-4 mx-4 mr-[6px]"
        >
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
            class="color-secondary m-auto font-semibold text-sm sm:text-xs px-4"
            >No NFTs added</span
          >
        </div>
      </div>
      <div class="flex justify-center mx-4">
        <div
          class="flex py-4 gap-2 items-center cursor-pointer flex-grow justify-center"
          @click.stop="handleManageNFT"
        >
          <img
            src="@/assets/images/settings.svg"
            class="invert dark:invert-0"
          />
          <span class="assets-view__add-token-text leading-[1]">Manage</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.assets-view__asset-name {
  max-width: 12ch;
  font-size: var(--fs-350);
  line-height: 1.5;
}

.nft-card {
  background: var(--nft-card-background);
}

.nft-card-title {
  font-size: var(--fs-300);
  color: var(--nft-card-title);
}

.nft-card-collection {
  font-size: var(--fs-250);
  color: var(--nft-card-collection);
}
</style>
