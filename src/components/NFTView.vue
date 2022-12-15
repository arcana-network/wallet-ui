<script setup lang="ts">
import { onMounted, reactive } from 'vue'
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
const nfts: NFT[] = reactive([])

function fetchStoredNftContracts(): NFTContract[] {
  const assetContracts = localStorage.getItem(
    `${userStore.walletAddress}/${rpcStore.selectedRpcConfig?.chainId}/nft-contracts`
  )
  if (assetContracts) {
    return (JSON.parse(assetContracts) as NFTContract[]).filter(
      (contract) => contract.type === 'erc721' || contract.type === 'erc1155'
    )
  } else {
    return []
  }
}

async function getNFTAssets() {
  const storedNftContracts = fetchStoredNftContracts()
  storedNftContracts.forEach((contract) => {
    nfts.push({
      type: contract.type,
      name: contract.name,
      balance: 0,
      imageUrl: contract.imageUrl,
      animationUrl: contract.animationUrl,
      description: contract.description,
      collectionName: contract.collectionName,
      tokenId: contract.tokenId,
      address: contract.address,
    })
  })
  storedNftContracts.forEach(async (contract) => {
    try {
      //
    } catch (err) {
      console.error({ err })
    }
  })
}

function handleManageNFT() {
  router.push({ name: 'ManageNft' })
}

onMounted(getNFTAssets)

rpcStore.$subscribe(getNFTAssets)
</script>

<template>
  <div class="flex flex-col px-4 divide-y-[1px] divide-gray-600">
    <div class="flex flex-col pt-5 pb-1 gap-5">
      <div
        v-for="nft in nfts"
        :key="`nft-${nft.address}-${nft.tokenId}`"
        class="flex justify-between items-center"
      >
        <div class="flex items-center gap-3">
          <span
            class="assets-view__asset-name leading-none overflow-hidden whitespace-nowrap text-ellipsis"
            :title="nft.name"
            >{{ nft.name }}</span
          >
        </div>
      </div>
    </div>
    <div class="flex justify-center">
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
</style>
