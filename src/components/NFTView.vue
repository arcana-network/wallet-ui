<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue'
import { useRouter } from 'vue-router'

import type { NFTContract, NFT } from '@/models/NFT'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import { getTokenBalance } from '@/utils/contractUtil'
import { formatTokenDecimals, beautifyBalance } from '@/utils/formatTokens'
import { getIconAsset } from '@/utils/useImage'

const userStore = useUserStore()
const rpcStore = useRpcStore()
const router = useRouter()
const nfts: Ref<NFT[]> = ref([])

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
  console.log(storedNfts)
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
    })
  })
  // storedNfts.forEach(async (contract) => {
  //   try {
  //     //
  //   } catch (err) {
  //     console.error({ err })
  //   }
  // })
}

function handleManageNFT() {
  router.push({ name: 'ManageNft' })
}

onMounted(getNFTAssets)

rpcStore.$subscribe(getNFTAssets)
</script>

<template>
  <div class="flex flex-col divide-y-[1px] max-h-72 divide-gray-600">
    <div
      v-if="nfts.length"
      class="grid grid-cols-2 gap-[10px] pt-5 pb-4 overflow-y-scroll mx-4 mr-[6px]"
    >
      <div
        v-for="nft in nfts"
        :key="`nft-${nft.address}-${nft.tokenId}`"
        class="nft-card rounded cursor-pointer"
        @click.stop="void 0"
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
      <span class="color-secondary m-auto font-semibold text-sm sm:text-xs px-4"
        >No NFTs added</span
      >
    </div>
    <div class="flex justify-center mx-4">
      <div
        class="flex py-4 gap-2 items-center cursor-pointer"
        @click.stop="handleManageNFT"
      >
        <img src="@/assets/images/settings.svg" class="invert dark:invert-0" />
        <span class="assets-view__add-token-text leading-[1]">Manage</span>
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
