<script setup lang="ts">
import { ethers } from 'ethers'
import { onMounted, onUnmounted, ref, Ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

import GasPrice from '@/components/GasPrice.vue'
import SendNftPreview from '@/components/SendNftPreview.vue'
import { NFT } from '@/models/NFT'
import {
  getGasPrice,
  GAS_AVAILABLE_CHAIN_IDS,
} from '@/services/gasPrice.service'
import { useActivitiesStore } from '@/store/activities'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import { convertGweiToEth } from '@/utils/gweiToEth'
import { getRequestHandler } from '@/utils/requestHandlerSingleton'
import { useImage } from '@/utils/useImage'

type SendNftProps = {
  nft: NFT
}

const emit = defineEmits(['close'])
const props = defineProps<SendNftProps>()

const showPreview = ref(false)
const rpcStore = useRpcStore()
const userStore = useUserStore()
const activitiesStore = useActivitiesStore()
const getImage = useImage()
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
  showLoader('Loading')
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
  showLoader('Sending')
  try {
    const accountHandler = getRequestHandler().getAccountHandler()
    const gasFees = ethers.utils
      .parseUnits(`${gasFeeInGwei.value}`, 'gwei')
      .toHexString()

    const txHash = await accountHandler.sendNft(
      props.nft.type,
      props.nft.address,
      userStore.walletAddress,
      setHexPrefix(recipientWalletAddress.value),
      props.nft.tokenId,
      1,
      gasFees
    )
    await activitiesStore.fetchAndSaveNFTActivityFromHash({
      chainId: rpcStore.selectedRpcConfig?.chainId,
      txHash,
      nft: props.nft,
      recipientAddress: setHexPrefix(recipientWalletAddress.value),
    })
    router.back()
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
          props.nft.type,
          props.nft.address,
          userStore.walletAddress,
          recipientWalletAddress.value,
          props.nft.tokenId,
          1
        )
      ).toString()
    } catch (e) {
      console.error({ e })
    }
    hideLoader()
    showPreview.value = true
  } else {
    toast.error('Please fill all values')
  }
}
</script>

<template>
  <div v-if="loader.show" class="h-full flex justify-center items-center">
    <p>Please Wait...</p>
  </div>
  <div v-else class="w-full">
    <SendNftPreview
      v-if="showPreview"
      :preview-data="{
        senderWalletAddress: userStore.walletAddress,
        recipientWalletAddress: setHexPrefix(recipientWalletAddress),
        gasFee: gasFeeInEth,
        estimatedGas,
        nftContractAddress: props.nft.address,
        tokenId: props.nft.tokenId,
        imageUrl: props.nft.imageUrl,
      }"
      @close="showPreview = false"
      @submit="handleSendToken"
    />
    <div v-else class="space-y-3 overflow-auto flex flex-col justify-between">
      <div class="flex flex-col space-y-3 sm:space-y-2">
        <div class="flex justify-between">
          <p class="text-xl sm:text-sm font-semibold">Send</p>
          <button class="h-auto" @click="emit('close')">
            <img :src="getImage('close-icon')" alt="close icon" />
          </button>
        </div>
      </div>
      <div class="mt-4 flex justify-center">
        <img :src="props.nft.imageUrl" class="rounded-[10px] w-24 h-24" />
      </div>
      <form
        class="space-y-4 sm:space-y-3 px-[1px]"
        @submit.prevent="handleShowPreview"
      >
        <div class="space-y-1">
          <label
            class="text-xs text-zinc-400 font-semibold"
            for="recipientWalletAddress"
          >
            Recipient’s Wallet Address
          </label>
          <div
            class="flex space-x-1 px-2 py-4 sm:p-1 input rounded-lg"
            :class="{
              'outline-black dark:outline-white outline-1 outline':
                isWalletAddressFocused,
            }"
          >
            <input
              id="recipientWalletAddress"
              v-model="recipientWalletAddress"
              required
              type="text"
              class="text-base sm:text-sm w-full bg-transparent rounded-lg border-none outline-none overflow-hidden text-ellipsis"
              placeholder="6yhjtikn7..."
              @focus="isWalletAddressFocused = true"
              @blur="isWalletAddressFocused = false"
            />
          </div>
        </div>
        <GasPrice
          :gas-price="`${gasFeeInGwei}`"
          :gas-prices="gasPrices"
          :base-fee="baseFee"
          @gas-price-input="handleSetGasPrice"
        />
        <div class="flex justify-between">
          <button
            class="text-sm sm:text-xs rounded-xl border-2 border-black dark:border-white bg-transparent text-black dark:text-white w-36 h-9 sm:w-20 sm:h-8 uppercase"
            @click.stop="emit('close')"
          >
            Cancel
          </button>
          <button
            class="text-sm sm:text-xs rounded-xl text-white dark:bg-white bg-black dark:text-black w-36 h-9 sm:w-20 sm:h-8 uppercase"
          >
            Proceed
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
