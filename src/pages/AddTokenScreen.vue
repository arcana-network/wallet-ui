<script setup lang="ts">
import { reactive, watch, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

import AppLoader from '@/components/AppLoader.vue'
import SearchToken from '@/components/SearchToken.vue'
import contractMap from '@/contract-map.json'
import type { AssetContract, EthAssetContract } from '@/models/Asset'
import { useModalStore } from '@/store/modal'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import { content, errors } from '@/utils/content'
import { getTokenSymbolAndDecimals } from '@/utils/contractUtil'
import { getImage } from '@/utils/getImage'
import { getStorage } from '@/utils/storageWrapper'

const storage = getStorage()
const isDisabled = reactive({
  symbol: false,
  decimals: false,
})
const router = useRouter()
const modalStore = useModalStore()
const ethMainnetTokens: EthAssetContract[] = Object.keys(contractMap)
  .map((address) => ({
    ...contractMap[address],
    address,
  }))
  .filter((contract) => contract.erc20 === true)
const rpcStore = useRpcStore()
const toast = useToast()
const userStore = useUserStore()
const loader = reactive({
  show: false,
  message: 'Saving token...',
})
const expandSection = ref(false)

const tokenContract: AssetContract = reactive({
  address: '',
  symbol: '',
  decimals: 0,
})

function handleSearchToken(selectedTokenContract: EthAssetContract) {
  if (selectedTokenContract) {
    tokenContract.address = selectedTokenContract.address
    tokenContract.symbol = selectedTokenContract.symbol
    tokenContract.decimals = selectedTokenContract.decimals
    tokenContract.logo = selectedTokenContract.logo
    tokenContract.name = selectedTokenContract.name
  }
}

async function addTokenContract() {
  loader.show = true
  const isValidContract = await validateAndPopulateContract()
  if (isValidContract) {
    if (
      !tokenContract.symbol?.trim() &&
      !tokenContract.decimals &&
      tokenContract.decimals !== 0
    ) {
      loader.show = false
      return toast.error(content.DETAILS)
    }
    const assetContracts = storage.local.getAssetContractList(
      userStore.walletAddress,
      Number(rpcStore.selectedRpcConfig?.chainId)
    )
    assetContracts.push({ ...tokenContract })
    storage.local.setAssetContractList(
      userStore.walletAddress,
      Number(rpcStore.selectedRpcConfig?.chainId),
      assetContracts
    )
    loader.show = false
    toast.success(content.TOKEN.ADDED)
    modalStore.setShowModal(false)
  } else {
    loader.show = false
    toast.error(content.CONTRACT.INVALID)
  }
}

function isContractInLocalStorage() {
  const assetContracts = getStorage().local.getAssetContractList(
    userStore.walletAddress,
    Number(rpcStore.selectedRPCConfig?.chainId)
  )
  if (assetContracts.length > 0) {
    if (
      assetContracts.find(
        (contract) => contract.address === tokenContract.address
      )
    ) {
      return true
    }
  }
  return false
}

function doesTokenBelongsToEthMainnet() {
  return (
    !rpcStore.isEthereumMainnet &&
    ethMainnetTokens.find(
      (contract) => contract.address === tokenContract.address
    )
  )
}

async function validateAndPopulateContract() {
  if (isContractInLocalStorage()) {
    loader.show = false
    toast.error(content.TOKEN.EXISTS)
    return false
  }
  if (doesTokenBelongsToEthMainnet()) {
    loader.show = false
    toast.error(content.TOKEN.ETH_MAINNET)
    return false
  }
  try {
    const { symbol, decimals } = await getTokenSymbolAndDecimals({
      contractAddress: tokenContract.address,
    })
    if (!symbol?.trim()) {
      isDisabled.symbol = false
    }
    if (!decimals && decimals !== 0) {
      isDisabled.decimals = false
    }
    tokenContract.symbol = symbol || tokenContract.symbol
    tokenContract.decimals = decimals || tokenContract.decimals || 0
    return true
  } catch (e) {
    loader.show = false
    tokenContract.symbol = ''
    tokenContract.decimals = 0
    toast.error(content.CONTRACT.INVALID)
    return false
  }
}

watch(
  () => tokenContract.address,
  async () => {
    if (tokenContract.address?.length == 42) {
      isDisabled.symbol = true
      isDisabled.decimals = true
      await validateAndPopulateContract()
    } else {
      tokenContract.symbol = ''
      tokenContract.decimals = 0
    }
  }
)

watch(
  () => rpcStore.selectedChainId,
  () => {
    router.replace({ name: 'home' })
  }
)
</script>

<template>
  <div class="flex flex-1 flex-col">
    <div
      v-if="loader.show"
      class="fixed inset-0 flex justify-center items-center z-50 opacity-90 backdrop-blur bg-white dark:bg-black"
    >
      <AppLoader :message="loader.message" />
    </div>
    <div class="flex flex-col gap-4">
      <h2 class="text-xl font-medium text-center">Add a Token</h2>
      <form class="flex flex-col" @submit.prevent="addTokenContract">
        <div v-if="rpcStore.isEthereumMainnet">
          <div class="flex flex-col gap-1">
            <label for="search-token" class="text-sm font-medium"
              >Search Token</label
            >
            <SearchToken
              :tokens="ethMainnetTokens"
              @change="handleSearchToken"
            />
          </div>
          <div class="flex justify-center items-center my-4">
            <button
              class="flex justify-center items-center"
              type="button"
              @click.stop="expandSection = !expandSection"
            >
              <span class="text-sm font-normal dark:text-white-100"
                >Add Custom Token</span
              >
              <img
                :src="getImage('arrow-down.svg')"
                class="w-xl h-xl transition-all will-change-transform duration-200"
                :class="{ '-rotate-180': expandSection }"
              />
            </button>
          </div>
        </div>
        <div
          v-if="expandSection || !rpcStore.isEthereumMainnet"
          class="flex flex-col gap-4"
        >
          <div class="flex flex-col gap-1">
            <label for="token-contract-address" class="text-sm font-medium"
              >Token Contract Address</label
            >
            <input
              id="token-contract-address"
              v-model.trim="tokenContract.address"
              type="text"
              placeholder="Eg. 0x000000000000"
              class="input-field focus:input-active"
              required
              autocomplete="off"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label for="token-symbol" class="text-sm font-medium"
              >Token Symbol</label
            >
            <input
              id="token-symbol"
              v-model="tokenContract.symbol"
              type="text"
              placeholder="Eg. XAR"
              class="input-field focus:input-active"
              :class="{ 'cursor-not-allowed': isDisabled.symbol }"
              required
              autocomplete="off"
              :disabled="isDisabled.symbol"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label for="token-decimal" class="text-sm font-medium"
              >Token Decimal</label
            >
            <input
              id="token-decimal"
              v-model="tokenContract.decimals"
              type="number"
              placeholder="0"
              class="input-field focus:input-active"
              :class="{ 'cursor-not-allowed': isDisabled.symbol }"
              min="0"
              step="1"
              required
              autocomplete="off"
              :disabled="isDisabled.decimals"
            />
          </div>
          <button
            type="submit"
            class="btn-primary uppercase font-medium text-base p-2 mt-5 w-full"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
#search-token::-webkit-calendar-picker-indicator,
#search-token::-webkit-list-button {
  display: none !important;
}

#search-token::-webkit-search-cancel-button {
  display: none;
}
</style>
