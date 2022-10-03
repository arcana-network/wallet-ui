<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'

import type { Asset, AssetContract } from '@/models/Asset'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import { formatTokenDecimals, beautifyBalance } from '@/utils/formatTokens'
import getImageAsset from '@/utils/getImageAsset'
import getTokenBalance from '@/utils/getTokenBalance'

const userStore = useUserStore()
const rpcStore = useRpcStore()
const router = useRouter()
const assets: Asset[] = reactive([])

function fetchStoredAssetContracts(): AssetContract[] {
  const assetContracts = localStorage.getItem(
    `${rpcStore.selectedRpcConfig?.chainId}-asset-contracts`
  )
  if (assetContracts) {
    return JSON.parse(assetContracts)
  } else {
    return []
  }
}

function fetchNativeAsset() {
  return {
    name: rpcStore.nativeCurrency.name,
    balance: formatTokenDecimals(
      rpcStore.walletBalance,
      rpcStore.nativeCurrency.decimals
    ),
    symbol: rpcStore.nativeCurrency.symbol,
    logo: rpcStore.selectedRpcConfig.favicon
      ? `${rpcStore.selectedRpcConfig.favicon}.png`
      : 'arcana-fallback-token-logo.svg',
  }
}

async function getAssetsBalance() {
  assets.push(fetchNativeAsset())
  const storedAssetContracts = fetchStoredAssetContracts()
  storedAssetContracts.forEach(async (contract) => {
    const balance = await getTokenBalance({
      privateKey: userStore.privateKey,
      rpcUrl: rpcStore.selectedRpcConfig?.rpcUrls[0] as string,
      walletAddress: userStore.walletAddress,
      contractAddress: contract.address,
    })
    assets.push({
      name: contract.name || contract.symbol,
      symbol: contract.symbol,
      balance: formatTokenDecimals(balance, contract.decimals),
      logo: contract.logo || 'arcana-fallback-token-logo.svg',
    })
  })
}

function handleAddToken() {
  router.push({ name: 'addToken' })
}

onMounted(getAssetsBalance)

rpcStore.$subscribe(getAssetsBalance)
</script>

<template>
  <div class="flex flex-col px-4">
    <div class="flex justify-end py-4 gap-1 items-center">
      <img
        class="dark:invert cursor-pointer w-6"
        src="@/assets/images/plus-circle.svg"
        alt="Click to add a token"
      />
      <span class="assets-view__add-token-text">Token</span>
    </div>
    <hr class="assets-view__separator" />
    <div
      v-for="asset in assets"
      :key="`asset-${asset.symbol}`"
      class="flex justify-between items-center py-[1.25rem]"
    >
      <div class="flex items-center gap-3">
        <img
          :src="getImageAsset(`token-logos/${asset.logo}`)"
          class="w-[1.25rem] aspect-square rounded-full"
        />
        <span class="assets-view__asset-name leading-none">{{
          asset.name
        }}</span>
      </div>
      <div
        class="assets-view__asset-balance flex flex-wrap leading-none text-right"
        :title="`${asset.balance} ${asset.symbol}`"
      >
        {{ beautifyBalance(asset.balance) }}
        {{ asset.symbol }}
      </div>
    </div>
  </div>
</template>

<style>
.assets-view__add-token-text,
.assets-view__asset-name,
.assets-view__asset-balance {
  font-size: var(--fs-350);
}

.assets-view__separator {
  border-top: 1px solid var(--color-philippine-gray);
}
</style>
