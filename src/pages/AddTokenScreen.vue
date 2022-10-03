<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

import SearchToken from '@/components/SearchToken.vue'
import contractMap from '@/contract-map.json'
import type { AssetContract, EthAssetContract } from '@/models/Asset'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import getTokenBalance from '@/utils/getTokenBalance'

const router = useRouter()
const ethMainnetTokens: EthAssetContract[] = Object.keys(contractMap).map(
  (address) => ({
    ...contractMap[address],
    address,
  })
)
const rpcStore = useRpcStore()
const toast = useToast()
const userStore = useUserStore()
const loader = reactive({
  show: false,
  message: 'Saving token...',
})

const tokenContract: AssetContract = reactive({
  address: '',
  symbol: '',
  decimals: 0,
})

function handleSearchToken(selectedTokenContract: EthAssetContract) {
  tokenContract.address = selectedTokenContract.address
  tokenContract.symbol = selectedTokenContract.symbol
  tokenContract.decimals = selectedTokenContract.decimals
  tokenContract.logo = selectedTokenContract.logo
  tokenContract.name = selectedTokenContract.name
}

function handleCancel() {
  router.back()
}

async function addTokenContract() {
  loader.show = true
  const assetContractsString = localStorage.getItem(
    `${rpcStore.selectedRpcConfig?.chainId}-asset-contracts`
  )
  let assetContracts: AssetContract[] = []
  if (assetContractsString) {
    assetContracts = JSON.parse(assetContractsString) as AssetContract[]
    if (
      assetContracts.find(
        (contract) => contract.address === tokenContract.address
      )
    ) {
      loader.show = false
      return toast.error('Token already added')
    }
    if (
      assetContracts.find(
        (contract) => contract.symbol === tokenContract.symbol
      )
    ) {
      loader.show = false
      return toast.error('Token symbol already in use')
    }
  }
  if (
    !rpcStore.isEthereumMainnet &&
    ethMainnetTokens.find(
      (contract) => contract.address === tokenContract.address
    )
  ) {
    loader.show = false
    return toast.error('Token belongs to Ethereum Mainnet')
  }
  try {
    await getTokenBalance({
      privateKey: userStore.privateKey,
      rpcUrl: rpcStore.selectedRpcConfig?.rpcUrls[0] as string,
      walletAddress: userStore.walletAddress,
      contractAddress: tokenContract.address,
    })
  } catch (e) {
    loader.show = false
    return toast.error('Invalid contract address')
  }
  assetContracts.push({ ...tokenContract })
  localStorage.setItem(
    `${rpcStore.selectedRpcConfig?.chainId}-asset-contracts`,
    JSON.stringify(assetContracts)
  )
  loader.show = false
  toast.success('Token Added successfully')
  router.push({ name: 'home' })
}
</script>

<template>
  <div class="wallet__card rounded-[10px] flex flex-1 flex-col mb-[2.5rem]">
    <div
      v-if="loader.show"
      class="fixed inset-0 flex justify-center items-center z-50 opacity-90 backdrop-blur bg-white dark:bg-black"
    >
      <p class="sm:text-xs text-black dark:text-white">{{ loader.message }}</p>
    </div>
    <div class="p-4 sm:p-2 h-full flex flex-col overflow-auto">
      <h2 class="font-semibold mb-5 add-token__title">Add a Token</h2>
      <form class="flex flex-col" @submit.prevent="addTokenContract">
        <div v-if="rpcStore.isEthereumMainnet">
          <div class="flex flex-col gap-1">
            <label for="search-token" class="text-sm font-semibold label"
              >Search Token</label
            >
            <SearchToken
              :tokens="ethMainnetTokens"
              @change="handleSearchToken"
            />
          </div>
          <div class="text-center my-6">Add Custom Token</div>
        </div>
        <div class="flex flex-col gap-5">
          <div class="flex flex-col gap-1">
            <label
              for="token-contract-address"
              class="text-sm font-semibold label"
              >Token Contract Address</label
            >
            <input
              id="token-contract-address"
              v-model="tokenContract.address"
              type="text"
              placeholder="Eg. 0x000000000000"
              class="text-base p-4 input"
              required
              autocomplete="off"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label for="token-symbol" class="text-sm font-semibold label"
              >Token Symbol</label
            >
            <input
              id="token-symbol"
              v-model="tokenContract.symbol"
              type="text"
              placeholder="Eg. XAR"
              class="text-base p-4 input"
              required
              autocomplete="off"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label for="token-decimal" class="text-sm font-semibold label"
              >Token Decimal</label
            >
            <input
              id="token-decimal"
              v-model="tokenContract.decimals"
              type="number"
              placeholder="0"
              class="text-base p-4 input"
              min="0"
              step="1"
              required
              autocomplete="off"
            />
          </div>
          <div class="flex space-x-3">
            <button
              type="reset"
              class="text-sm sm:text-xs rounded-xl text-black border-white border-2 dark:text-white dark:border-white flex-1 font-semibold uppercase"
              @click.stop="handleCancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="text-sm sm:text-xs rounded-xl text-white dark:bg-white bg-black dark:text-black flex-1 font-semibold uppercase"
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.add-token__title {
  font-size: var(--fs-500);
}

#search-token::-webkit-calendar-picker-indicator,
#search-token::-webkit-list-button {
  display: none !important;
}

#search-token::-webkit-search-cancel-button {
  display: none;
}
</style>
