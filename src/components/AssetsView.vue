<script setup lang="ts">
import { ethers } from 'ethers'
import { onMounted, reactive, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

import type { Asset, AssetContract } from '@/models/Asset'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import { getTokenBalance } from '@/utils/contractUtil'
import { formatTokenDecimals, beautifyBalance } from '@/utils/formatTokens'
import { getImage } from '@/utils/getImage'
import { getStorage } from '@/utils/storageWrapper'
import { getIconAsset } from '@/utils/useImage'

const userStore = useUserStore()
const rpcStore = useRpcStore()
const router = useRouter()
const assets: Asset[] = reactive([])
let assetsPolling

function fetchStoredAssetContracts(): AssetContract[] {
  const assetContracts = getStorage().local.getItem(
    `${userStore.walletAddress}/${Number(
      rpcStore.selectedRpcConfig?.chainId
    )}/asset-contracts`
  )
  if (assetContracts) {
    return JSON.parse(assetContracts) as AssetContract[]
  } else {
    return []
  }
}

function fetchNativeAsset() {
  return {
    address: 'native',
    name: rpcStore.nativeCurrency.name,
    balance: !rpcStore.walletBalance
      ? 0
      : Number(ethers.utils.formatEther(rpcStore.walletBalance)),
    decimals: rpcStore.nativeCurrency.decimals,
    symbol: rpcStore.nativeCurrency.symbol,
    logo:
      rpcStore.selectedRpcConfig && rpcStore.selectedRpcConfig.favicon
        ? `${rpcStore.selectedRpcConfig.favicon}.png`
        : 'fallback-token.png',
  }
}

async function getAssetsBalance() {
  assets.length = 0
  assets.push(fetchNativeAsset())
  const storedAssetContracts = fetchStoredAssetContracts()
  storedAssetContracts.forEach((contract) => {
    assets.push({
      address: contract.address,
      name: contract.name || contract.symbol,
      symbol: contract.symbol,
      balance: 0,
      logo: contract.logo || 'fallback-token.png',
      decimals: contract.decimals,
    })
  })
  storedAssetContracts.forEach(async (contract) => {
    try {
      const balance = await getTokenBalance({
        walletAddress: userStore.walletAddress,
        contractAddress: contract.address,
      })
      const asset = assets.find((asset) => asset.address === contract.address)
      if (asset) {
        asset.balance = formatTokenDecimals(balance, contract.decimals)
      }
    } catch (err) {
      console.error({ err })
    }
  })
}

function updateAssetsBalance() {
  assets.forEach(async (asset) => {
    if (asset.address !== 'native') {
      const balance = await getTokenBalance({
        walletAddress: userStore.walletAddress,
        contractAddress: asset.address,
      })
      asset.balance = formatTokenDecimals(balance, asset.decimals)
    }
  })
}

function handleAddToken() {
  router.push({ name: 'AddToken' })
}

function isNative(asset: Asset) {
  return asset.address === 'native'
}

onMounted(async () => {
  await getAssetsBalance()
  assetsPolling = setInterval(updateAssetsBalance, 4000)
})

onBeforeUnmount(() => {
  if (assetsPolling) {
    clearInterval(assetsPolling)
  }
})

rpcStore.$subscribe(getAssetsBalance)
</script>

<template>
  <div class="flex flex-col gap-3">
    <span class="uppercase font-lg font-bold">Assets</span>
    <div class="card flex flex-col overflow-hidden">
      <div
        v-if="assets.length"
        class="flex flex-col gap-4 p-3 m-1 max-h-[120px] overflow-y-auto"
      >
        <div
          v-for="asset in assets"
          :key="`asset-${asset.symbol}`"
          class="flex justify-between items-center"
        >
          <div class="flex items-center gap-3">
            <img
              :src="getIconAsset(`token-logos/${asset.logo}`)"
              class="w-[1.25rem] aspect-square rounded-full select-none"
            />
            <span
              class="font-normal text-base overflow-hidden whitespace-nowrap text-ellipsis w-[12ch]"
              :title="asset.name"
              >{{ asset.name }}</span
            >
          </div>
          <div
            class="gap-1 font-normal text-base leading-none text-right overflow-hidden whitespace-nowrap text-ellipsis"
            :title="`${
              isNative(asset)
                ? ethers.utils.formatEther(rpcStore.walletBalance)
                : asset.balance.toFixed(asset.decimals)
            } ${asset.symbol}`"
          >
            {{ beautifyBalance(asset.balance) }}
            {{ asset.symbol }}
          </div>
        </div>
      </div>
      <div v-else class="flex flex-col flex-grow py-5 gap-5">
        <span class="m-auto font-normal text-base">No tokens added</span>
      </div>
      <button
        class="flex py-1 gap-2 items-center justify-center flex-grow btn-quaternery border-r-0 border-l-0 border-b-0 border-t-1"
        @click.stop="handleAddToken"
      >
        <img :src="getImage('plus.svg')" class="h-lg w-lg" />
        <span class="text-sm font-normal">New</span>
      </button>
    </div>
  </div>
</template>
