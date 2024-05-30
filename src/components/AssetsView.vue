<script setup lang="ts">
import Decimal from 'decimal.js'
import { onMounted, onBeforeUnmount, ref, watch, type Ref, computed } from 'vue'

import type { Asset, AssetContract } from '@/models/Asset'
import AddTokenScreen from '@/pages/AddTokenScreen.vue'
import { getChainLogoUrl } from '@/services/chainlist.service'
import { useAppStore } from '@/store/app'
import { useModalStore } from '@/store/modal'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import {
  MultiversXAccountHandler,
  SolanaAccountHandler,
} from '@/utils/accountHandler'
import { ChainType } from '@/utils/chainType'
import { PREDEFINED_ERC20_TOKENS } from '@/utils/constants'
import { getTokenBalance } from '@/utils/contractUtil'
import { formatTokenDecimals } from '@/utils/formatTokens'
import { getImage } from '@/utils/getImage'
import { getRequestHandler } from '@/utils/requestHandlerSingleton'
import { getStorage } from '@/utils/storageWrapper'
import { getIconAsset } from '@/utils/useImage'

const userStore = useUserStore()
const rpcStore = useRpcStore()
const assets: Ref<Asset[]> = ref([])
const modalStore = useModalStore()
const showModal = ref(false)
let assetsPolling
const appStore = useAppStore()

type AssetProps = {
  refresh: boolean
}

const props = defineProps<AssetProps>()
const storage = getStorage()

const nativeAssetBalance = computed(() => {
  const decimals = getRequestHandler().getAccountHandler().decimals
  return new Decimal(rpcStore.walletBalance).div(Decimal.pow(10, decimals))
})

function getChainType(chainType: ChainType) {
  switch (chainType) {
    case ChainType.evm_secp256k1:
      return 'EVM'
    case ChainType.solana_cv25519:
      return 'solana'
    case ChainType.multiversx_cv25519:
      return 'multiversx'
    case ChainType.near_cv25519:
      return 'near'
  }
}

function fetchStoredAssetContracts(): AssetContract[] {
  const assetContracts = storage.local.getAssetContractList(
    userStore.walletAddress,
    Number(rpcStore.selectedRPCConfig?.chainId)
  )
  const predefinedTokens =
    PREDEFINED_ERC20_TOKENS[Number(rpcStore.selectedRPCConfig?.chainId)]
  if (predefinedTokens) {
    let shouldSync = false
    predefinedTokens.forEach((token) => {
      if (
        !assetContracts.find((contract) => contract.address === token.address)
      ) {
        assetContracts.push(token)
        shouldSync = true
      }
    })
    if (shouldSync) {
      storage.local.setAssetContractList(
        userStore.walletAddress,
        Number(rpcStore.selectedRPCConfig?.chainId),
        assetContracts
      )
    }
  }
  return assetContracts
}

function fetchNativeAsset() {
  return {
    address: 'native',
    name: rpcStore.nativeCurrency?.name,
    balance: !rpcStore.walletBalance
      ? 0
      : nativeAssetBalance.value.toDecimalPlaces(4).toNumber(),
    decimals: rpcStore.nativeCurrency?.decimals as number,
    symbol: rpcStore.nativeCurrency?.symbol as string,
    image: getChainLogoUrl(
      Number(rpcStore.selectedChainId),
      getChainType(appStore.chainType)
    ),
  }
}

async function getAssetsBalance() {
  if (appStore.chainType === ChainType.multiversx_cv25519) {
    await getMultiversxBalance()
  } else if (appStore.chainType === ChainType.solana_cv25519) {
    await getSolanaBalance()
  } else if (appStore.chainType === ChainType.evm_secp256k1) {
    await getEVMAssetBalance()
  }
}

async function getMultiversxBalance() {
  const accountHandler =
    getRequestHandler().getAccountHandler() as MultiversXAccountHandler
  const multiversxTokens = await accountHandler.getFungibleTokens()
  assets.value = multiversxTokens.map((item) => {
    return {
      name: item.rawResponse.name,
      balance: formatTokenDecimals(
        item.rawResponse.balance,
        item.rawResponse.decimals
      ),
      symbol: item.rawResponse.ticker,
      decimals: item.rawResponse.decimals,
      logo: 'fallback-token.png',
    } as Asset
  })
}

async function getSolanaBalance() {
  const solanaSPLTokens = await (
    getRequestHandler().getAccountHandler() as SolanaAccountHandler
  ).getAllUserSPLTokens()
  assets.value = [fetchNativeAsset(), ...solanaSPLTokens]
}

async function getEVMAssetBalance() {
  assets.value = [fetchNativeAsset()]
  const storedAssetContracts = fetchStoredAssetContracts()
  storedAssetContracts.forEach((contract) => {
    assets.value.push({
      address: contract.address,
      name: contract.name || contract.symbol,
      symbol: contract.symbol,
      balance: 0,
      image: contract.image,
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
      const asset = assets.value.find(
        (asset) => asset.address === contract.address
      )
      if (asset) {
        asset.balance = formatTokenDecimals(balance, contract.decimals)
      }
    } catch (err) {
      console.error({ err })
    }
  })
}

function handleAddToken() {
  modalStore.setShowModal(true)
  showModal.value = true
}

function isNative(asset: Asset) {
  return asset.address === 'native'
}

onMounted(async () => {
  await getAssetsBalance()
})

onBeforeUnmount(() => {
  clearInterval(assetsPolling)
})

rpcStore.$subscribe(getAssetsBalance)

watch(
  () => modalStore.show,
  async () => {
    if (!modalStore.show) {
      showModal.value = false
      clearInterval(assetsPolling)
      await getAssetsBalance()
    }
  }
)

watch(
  () => props.refresh,
  async () => {
    await getAssetsBalance()
  }
)

function handleFallbackLogo(event) {
  event.target.src = getImage('blockchain-icon.png')
}
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
              :src="asset.image || getIconAsset(`token-logos/${asset.logo}`)"
              class="w-[1.25rem] aspect-square rounded-full select-none"
              @error="handleFallbackLogo"
            />
            <span
              class="font-normal text-base overflow-hidden whitespace-nowrap text-ellipsis w-[12ch]"
              :title="asset.name"
              >{{ asset.name }}</span
            >
          </div>
          <div
            class="gap-1 font-normal text-base leading-none text-right overflow-hidden whitespace-nowrap text-ellipsis transition-all duration-200"
            :title="`${
              isNative(asset) ? nativeAssetBalance.toString() : asset.balance
            } ${asset.symbol}`"
          >
            {{ new Decimal(asset.balance).toDecimalPlaces(4) }}
            {{ asset.symbol }}
          </div>
        </div>
      </div>
      <div v-else class="flex flex-col flex-grow py-5 gap-5">
        <span class="m-auto font-normal text-base">No tokens added</span>
      </div>
      <button
        v-if="appStore.chainType === ChainType.evm_secp256k1"
        class="flex py-1 gap-2 items-center justify-center flex-grow btn-quaternery border-r-0 border-l-0 border-b-0 border-t-1"
        @click.stop="handleAddToken"
      >
        <img :src="getImage('plus.svg')" class="h-lg w-lg" />
        <span class="text-sm font-normal">New</span>
      </button>
    </div>
    <Teleport v-if="modalStore.show" to="#modal-container">
      <AddTokenScreen v-if="showModal" />
    </Teleport>
  </div>
</template>
