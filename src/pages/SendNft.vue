<script setup lang="ts">
import { ethers } from 'ethers'
import { onMounted, onUnmounted, ref, Ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

import AppLoader from '@/components/AppLoader.vue'
import GasPrice from '@/components/GasPrice.vue'
import SendNftPreview from '@/components/SendNftPreview.vue'
import { type NFTContractType } from '@/models/NFT'
import {
  getGasPrice,
  GAS_AVAILABLE_CHAIN_IDS,
} from '@/services/gasPrice.service'
import { useActivitiesStore } from '@/store/activities'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import { getImage } from '@/utils/getImage'
import { convertGweiToEth } from '@/utils/gweiToEth'
import { getRequestHandler } from '@/utils/requestHandlerSingleton'

type SendNftProps = {
  type: NFTContractType
  address: string
  tokenId: string
  collectionName: string
  name: string
  description?: string
  imageUrl: string
  animationUrl?: string
  attributes?: string
  balance?: number
}

const emit = defineEmits(['close'])
const props = defineProps<SendNftProps>()

const showPreview = ref(false)
const rpcStore = useRpcStore()
const userStore = useUserStore()
const activitiesStore = useActivitiesStore()
const toast = useToast()
const isWalletAddressFocused = ref(false)
const chainId = Number(rpcStore.selectedChainId)
const router = useRouter()

const recipientWalletAddress = ref('')
const gasFeeInGwei = ref('')
const gasFeeInEth = ref('')
const estimatedGas = ref('0')
const gasPrices: Ref<object> = ref({})
const loader = ref({
  show: false,
  message: '',
})
const baseFee = ref('0')
const quantity = ref(1)
const isQuantityFocused = ref(false)

watch(
  () => gasFeeInGwei.value,
  () => {
    if (gasFeeInEth.value) {
      gasFeeInEth.value = convertGweiToEth(gasFeeInGwei.value)
    }
  }
)

function showLoader(message) {
  loader.value.show = true
  loader.value.message = `${message}...`
}

function hideLoader() {
  loader.value.show = false
  loader.value.message = ''
}

let baseFeePoll
let gasSliderPoll

onMounted(async () => {
  showLoader('Loading...')
  try {
    await fetchBaseFee()
    if (GAS_AVAILABLE_CHAIN_IDS.includes(chainId)) {
      await fetchGasSliderValues()
      gasSliderPoll = setInterval(fetchGasSliderValues, 2000)
    }
    baseFeePoll = setInterval(fetchBaseFee, 2000)
  } catch (err) {
    console.log({ err })
  } finally {
    hideLoader()
  }
})

onUnmounted(() => {
  if (baseFeePoll) clearInterval(baseFeePoll)
  if (gasSliderPoll) clearInterval(gasSliderPoll)
})

async function fetchBaseFee() {
  const accountHandler = getRequestHandler().getAccountHandler()
  const baseGasPrice = (await accountHandler.provider.getGasPrice()).toString()
  baseFee.value = ethers.utils.formatUnits(baseGasPrice, 'gwei')
}

async function fetchGasSliderValues() {
  const data = await getGasPrice(chainId)
  gasPrices.value = data
}

function clearForm() {
  recipientWalletAddress.value = ''
  gasFeeInGwei.value = ''
}

function setHexPrefix(value: string) {
  const hexPrefix = '0x'
  return value.startsWith(hexPrefix) ? value : `${hexPrefix}${value}`
}

async function handleSendToken() {
  showLoader('Sending...')
  try {
    const accountHandler = getRequestHandler().getAccountHandler()
    const gasFees = ethers.utils
      .parseUnits(`${gasFeeInGwei.value}`, 'gwei')
      .toHexString()

    const txHash = await accountHandler.sendNft(
      props.type,
      props.address,
      userStore.walletAddress,
      setHexPrefix(recipientWalletAddress.value),
      props.tokenId,
      1,
      gasFees
    )
    const nft = {
      ...props,
    }
    nft.attributes = props.attributes ? JSON.parse(props.attributes) : []
    await activitiesStore.fetchAndSaveNFTActivityFromHash({
      chainId: rpcStore.selectedRpcConfig?.chainId as string,
      txHash,
      nft,
      recipientAddress: setHexPrefix(recipientWalletAddress.value),
    })
    router.push({ name: 'Nfts' })
    toast.success('Tokens sent Successfully')
  } catch (err: any) {
    if (err && err.reason) {
      toast.error(err.reason)
    }
  } finally {
    showPreview.value = false
    emit('close')
    hideLoader()
    clearForm()
  }
}

function handleSetGasPrice(value) {
  gasFeeInGwei.value = value
}

async function handleShowPreview() {
  if (!gasFeeInGwei.value) {
    gasFeeInGwei.value = baseFee.value
  }
  if (recipientWalletAddress.value && gasFeeInGwei.value) {
    showLoader('Loading preview...')
    try {
      const accountHandler = getRequestHandler().getAccountHandler()
      estimatedGas.value = (
        await accountHandler.estimateNftGas(
          props.type,
          props.address,
          userStore.walletAddress,
          recipientWalletAddress.value,
          props.tokenId,
          1
        )
      ).toString()
    } catch (e) {
      console.error({ e })
      toast.error('Cannot estimate gas fee. Please try again later.')
    } finally {
      gasFeeInEth.value = ethers.utils
        .formatEther(ethers.utils.parseUnits(`${gasFeeInGwei.value}`, 'gwei'))
        .toString()
      showPreview.value = true
      hideLoader()
    }
  } else {
    toast.error('Please fill all values')
  }
}
</script>

<template>
  <div v-if="loader.show" class="h-full flex justify-center items-center">
    <AppLoader :message="loader.message" />
  </div>
  <div v-else class="w-full flex flex-grow mb-5">
    <SendNftPreview
      v-if="showPreview"
      :preview-data="{
        senderWalletAddress: userStore.walletAddress,
        recipientWalletAddress: setHexPrefix(recipientWalletAddress),
        gasFee: gasFeeInEth,
        estimatedGas,
        nftContractAddress: props.address,
        tokenId: props.tokenId,
        imageUrl: props.imageUrl,
        quantity,
      }"
      @close="showPreview = false"
      @submit="handleSendToken"
    />
    <div v-else class="flex flex-col flex-grow justify-between gap-5">
      <div class="relative flex justify-center items-center">
        <button
          class="absolute left-0"
          title="Click to go back"
          @click.stop="router.go(-1)"
        >
          <img :src="getImage('back-arrow.svg')" class="w-6 h-6" />
        </button>
        <span class="text-lg font-bold">Send Token</span>
      </div>
      <div class="flex justify-center">
        <img :src="props.imageUrl" class="rounded-[10px] w-24 h-24" />
      </div>
      <form
        class="flex flex-col flex-grow justify-between gap-5"
        @submit.prevent="handleShowPreview"
      >
        <div class="flex flex-col gap-3">
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium" for="recipientWalletAddress">
              Recipient’s Wallet Address
            </label>
            <input
              id="recipientWalletAddress"
              v-model="recipientWalletAddress"
              required
              type="text"
              class="input-field"
              :class="{ 'input-active': isWalletAddressFocused }"
              placeholder="Enter Recipient’s Wallet Address"
              @focus="isWalletAddressFocused = true"
              @blur="isWalletAddressFocused = false"
            />
          </div>
          <div v-if="props.type === 'erc1155'" class="flex flex-col gap-1">
            <label class="text-sm font-medium" for="quantity"> Quantity </label>
            <input
              id="quantity"
              v-model="quantity"
              required
              type="text"
              class="input-field"
              :class="{ 'input-active': isQuantityFocused }"
              placeholder="Enter Recipient’s Wallet Address"
              @focus="isQuantityFocused = true"
              @blur="isQuantityFocused = false"
            />
            <div class="flex justify-end gap-1">
              <span class="text-xs text-gray-100">Total:</span>
              <span class="text-xs">{{ props.balance }} copies</span>
            </div>
          </div>
          <GasPrice
            :gas-price="gasFeeInGwei"
            :gas-prices="gasPrices"
            :base-fee="baseFee"
            @gas-price-input="handleSetGasPrice"
          />
        </div>
        <div class="flex">
          <button
            class="btn-primary uppercase p-[10px] font-bold text-base flex-grow text-center"
          >
            Preview
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
