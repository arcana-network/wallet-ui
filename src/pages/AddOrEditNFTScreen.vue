<script setup lang="ts">
import { onBeforeMount, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

import AppLoader from '@/components/AppLoader.vue'
import SearchToken from '@/components/SearchToken.vue'
import contractMap from '@/contract-map.json'
import type { EthAssetContract } from '@/models/Asset'
import { NFT } from '@/models/NFT'
import { getNFTDetails, modifyIpfsUrl } from '@/services/getNFTDetails.service'
import { NFTDB } from '@/services/nft.service'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import {
  getCollectionName,
  getERCStandard,
  getTokenUri,
  checkOwnership,
} from '@/utils/nftUtils'
import { getStorage } from '@/utils/storageWrapper'
import { useImage } from '@/utils/useImage'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const getImage = useImage()
const storage = getStorage()
const rpcStore = useRpcStore()
const userStore = useUserStore()

type EditNFTProps = {
  collectionName?: string
  address?: string
  tokenId?: string
}

const props = defineProps<EditNFTProps>()

let nftDB: NFTDB

onBeforeMount(async () => {
  nftDB = await NFTDB.create(storage.local, userStore.walletAddress)
})

const canEdit = false
const canDelete = route.name === 'EditNft'
const showAddressOutline = ref(false)

const ethMainnetNftContracts: EthAssetContract[] = Object.keys(contractMap)
  .map((address) => ({
    ...contractMap[address],
    address,
  }))
  .filter((contract) => contract.erc721 === true || contract.erc1155 === true)

const loader = reactive({
  show: false,
  message: 'Saving NFT...',
})

const nftContract = reactive({
  address: props.address || '',
  name: props.collectionName || '',
  tokenId: props.tokenId || '',
})

function handleSearchToken(selectedNftContract: EthAssetContract) {
  if (selectedNftContract) {
    nftContract.address = selectedNftContract.address
    nftContract.name = selectedNftContract.name || ''
  }
}

function sanitizeUrl(url?: string) {
  if (url && url.includes('ipfs://')) {
    return modifyIpfsUrl(url)
  }
  return url
}

function doesTokenBelongsToEthMainnet() {
  return (
    !rpcStore.isEthereumMainnet &&
    ethMainnetNftContracts.find(
      (contract) => contract.address === nftContract.address
    )
  )
}

async function handleSubmit() {
  loader.show = true
  if (!nftContract.name || !nftContract.tokenId) {
    loader.show = false
    return toast.error('Enter all the details to continue')
  }

  if (doesTokenBelongsToEthMainnet()) {
    loader.show = false
    return toast.error('Token belongs to Ethereum Mainnet')
  }

  const storedNfts = nftDB.getNFTs(Number(rpcStore.selectedChainId))

  const existingStoredNft = storedNfts.find(
    (nft) =>
      nft.address.toLowerCase() === nftContract.address.toLowerCase() &&
      nft.tokenId.toLowerCase() === nftContract.tokenId.toLowerCase()
  )

  if (existingStoredNft) {
    loader.show = false
    return toast.error('NFT already added')
  }

  const ercStandard = await getERCStandard(nftContract.address)
  if (!ercStandard) {
    loader.show = false
    return toast.error('Unsupported NFT')
  }

  let hasOwnership: {
    owner: boolean
    balance: number
  }

  try {
    hasOwnership = await checkOwnership(ercStandard, {
      tokenId: nftContract.tokenId,
      contractAddress: nftContract.address,
    })
  } catch (e) {
    console.error(e)
    toast.error('Invalid token ID')
    loader.show = false
    return
  }

  if (!hasOwnership.owner) {
    loader.show = false
    return toast.error("You don't have ownership for this NFT")
  }

  const tokenUri = await getTokenUri(ercStandard, {
    tokenId: nftContract.tokenId,
    contractAddress: nftContract.address,
  })
  if (tokenUri) {
    try {
      const tokenDetails = await getNFTDetails(tokenUri, nftContract.tokenId)
      const imageUrl = tokenDetails.image_url || tokenDetails.image
      const sanitizedImageUrl = sanitizeUrl(imageUrl) as string
      const animationUrl = tokenDetails.animation_url || tokenDetails.animation
      const sanitizedAnimationUrl = sanitizeUrl(animationUrl)
      const attributes = tokenDetails.attributes?.length
        ? tokenDetails.attributes.map((attribute) => ({
            trait: attribute.trait_type || attribute.trait,
            value: attribute.value,
          }))
        : []
      const nftDetails: NFT = {
        tokenId: nftContract.tokenId,
        type: ercStandard,
        address: nftContract.address,
        collectionName: nftContract.name,
        name: tokenDetails.name || `#${nftContract.tokenId}`,
        description: tokenDetails.description,
        imageUrl: sanitizedImageUrl,
        animationUrl: sanitizedAnimationUrl,
        attributes,
        balance: hasOwnership.balance,
        tokenUrl: tokenUri,
      }

      nftDB.addNFT(nftDetails, Number(rpcStore.selectedChainId))
      toast.success('NFT added')

      router.back()
    } catch (e) {
      console.error(e)
      toast.error(e)
    }
  } else {
    toast.error('Invalid token ID')
  }
  loader.show = false
}

function handleDeleteNft() {
  loader.show = true
  loader.message = 'Deleting NFT...'
  const storedNfts = nftDB.getNFTs(Number(rpcStore.selectedChainId))
  const existingNft = storedNfts.find(
    (nft) =>
      nft.address.toLowerCase() === nftContract.address.toLowerCase() &&
      nft.tokenId.toLowerCase() === nftContract.tokenId.toLowerCase()
  )
  if (existingNft)
    nftDB.removeNFT(existingNft, Number(rpcStore.selectedChainId))
  toast.success('NFT deleted')
  router.back()
  loader.show = false
}

watch(
  () => nftContract.address,
  async () => {
    if (nftContract.address?.length == 42) {
      try {
        const name = await getCollectionName(nftContract.address)
        nftContract.name = name
      } catch (e) {
        toast.error('Invalid contract address')
        nftContract.name = ''
      }
    } else {
      nftContract.name = ''
    }
  }
)
</script>

<template>
  <div class="wallet__card rounded-[10px] flex flex-1 flex-col">
    <div
      v-if="loader.show"
      class="fixed inset-0 flex justify-center items-center z-50 opacity-90 backdrop-blur bg-white dark:bg-black"
    >
      <AppLoader :message="loader.message" />
    </div>
    <div class="p-4 sm:p-2 h-full flex flex-col overflow-auto">
      <div v-if="canDelete" class="flex justify-between items-start">
        <h2 class="font-semibold mb-5 add-token__title">Edit NFT</h2>
        <img
          :src="getImage('trash-icon')"
          class="cursor-pointer"
          @click.stop="handleDeleteNft"
        />
      </div>
      <h2 v-else class="font-semibold mb-5 add-token__title">Add NFT</h2>
      <form class="flex flex-col flex-grow" @submit.prevent="handleSubmit">
        <div v-if="rpcStore.isEthereumMainnet && !canEdit">
          <div class="flex flex-col gap-1">
            <label for="search-token" class="text-sm font-semibold label"
              >Search Token</label
            >
            <SearchToken
              :tokens="ethMainnetNftContracts"
              @change="handleSearchToken"
            />
          </div>
          <div class="text-center my-6">Add Custom NFT</div>
        </div>
        <div class="flex flex-col gap-5 flex-grow">
          <div class="flex flex-col gap-1">
            <label
              for="token-contract-address"
              class="text-sm font-semibold label"
              >Collection Contract Address</label
            >
            <input
              v-if="canEdit"
              id="token-contract-address"
              v-model.trim="nftContract.address"
              type="text"
              placeholder="Paste the hexadecimal address"
              class="text-base p-4 input text-ellipsis overflow-hidden whitespace-nowrap cursor-not-allowed"
              required
              disabled
              autocomplete="off"
            />
            <div
              v-else
              class="p-4 input flex"
              :class="{
                'outline-black dark:outline-white outline-1 outline':
                  showAddressOutline,
              }"
            >
              <input
                id="token-contract-address"
                v-model.trim="nftContract.address"
                type="text"
                placeholder="Paste the hexadecimal address"
                class="text-base bg-transparent outline-none text-ellipsis overflow-hidden whitespace-nowrap flex-grow"
                required
                autocomplete="off"
                @focus="showAddressOutline = true"
                @blur="showAddressOutline = false"
              />
            </div>
          </div>
          <div class="flex flex-col gap-1">
            <label for="token-symbol" class="text-sm font-semibold label"
              >Collection Name</label
            >
            <input
              id="token-symbol"
              v-model="nftContract.name"
              type="text"
              placeholder="Provide the name"
              class="text-base p-4 input cursor-not-allowed"
              required
              autocomplete="off"
              disabled
            />
          </div>
          <div class="flex flex-col gap-1">
            <label for="token-decimal" class="text-sm font-semibold label"
              >Token ID</label
            >
            <input
              id="token-decimal"
              v-model="nftContract.tokenId"
              type="text"
              placeholder="Provide an ID"
              class="text-base p-4 input"
              min="0"
              step="1"
              required
              autocomplete="off"
            />
          </div>
          <div class="flex space-x-3 mt-auto">
            <button
              type="reset"
              class="text-sm sm:text-xs rounded-xl text-black border-black border-2 dark:text-white dark:border-white flex-1 font-semibold uppercase"
              @click.stop="() => router.back()"
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
