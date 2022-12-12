<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'

import type { Asset, AssetContract } from '@/models/Asset'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import { getTokenBalance } from '@/utils/contractUtil'
import { formatTokenDecimals, beautifyBalance } from '@/utils/formatTokens'
import { getIconAsset } from '@/utils/useImage'

const userStore = useUserStore()
const rpcStore = useRpcStore()
const router = useRouter()
const assets: Asset[] = reactive([])

function fetchStoredAssetContracts(): AssetContract[] {
  const assetContracts = localStorage.getItem(
    `${userStore.walletAddress}/${rpcStore.selectedRpcConfig?.chainId}/asset-contracts`
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
    decimals: rpcStore.nativeCurrency.decimals,
    symbol: rpcStore.nativeCurrency.symbol,
    logo:
      rpcStore.selectedRpcConfig && rpcStore.selectedRpcConfig.favicon
        ? `${rpcStore.selectedRpcConfig.favicon}.png`
        : 'arcana-fallback-token-logo.svg',
  }
}

async function getAssetsBalance() {
  assets.push(fetchNativeAsset())
  const storedAssetContracts = fetchStoredAssetContracts()
  storedAssetContracts.forEach((contract) => {
    assets.push({
      name: contract.name || contract.symbol,
      symbol: contract.symbol,
      balance: 0,
      logo: contract.logo || 'arcana-fallback-token-logo.svg',
      decimals: contract.decimals,
    })
  })
  storedAssetContracts.forEach(async (contract) => {
    try {
      const balance = await getTokenBalance({
        walletAddress: userStore.walletAddress,
        contractAddress: contract.address,
      })
      const asset = assets.find((asset) => asset.symbol === contract.symbol)
      if (asset) {
        asset.balance = formatTokenDecimals(balance, contract.decimals)
      }
    } catch (err) {
      console.error({ err })
    }
  })
}

function handleAddToken() {
  router.push({ name: 'addToken' })
}

onMounted(getAssetsBalance)

rpcStore.$subscribe(getAssetsBalance)
</script>

<template>
  <div class="flex flex-col px-4 divide-y-[1px] divide-gray-600">
    <div class="flex flex-col pt-5 pb-1 gap-5">
      <div
        v-for="asset in assets"
        :key="`asset-${asset.symbol}`"
        class="flex justify-between items-center"
      >
        <div class="flex items-center gap-3">
          <img
            :src="getIconAsset(`token-logos/${asset.logo}`)"
            class="w-[1.25rem] aspect-square rounded-full"
          />
          <span
            class="assets-view__asset-name leading-none overflow-hidden whitespace-nowrap text-ellipsis"
            :title="asset.name"
            >{{ asset.name }}</span
          >
        </div>
        <div
          class="assets-view__asset-balance flex flex-wrap leading-none text-right overflow-hidden whitespace-nowrap text-ellipsis"
          :title="`${asset.balance.toFixed(asset.decimals)} ${asset.symbol}`"
        >
          {{ beautifyBalance(asset.balance) }}
          {{ asset.symbol }}
        </div>
      </div>
    </div>
    <div class="flex justify-center">
      <div
        class="flex py-4 gap-2 items-center cursor-pointer"
        @click.stop="handleAddToken"
      >
        <img src="@/assets/images/settings.svg" class="invert dark:invert-0" />
        <span class="assets-view__add-token-text leading-[1]">Manage</span>
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

.assets-view__asset-name {
  max-width: 12ch;
  line-height: 1.5;
}

.assets-view__asset-balance {
  max-width: 10ch;
}
</style>
