<script setup lang="ts">
import { Decimal } from 'decimal.js'
import { onMounted, onUnmounted, ref, Ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

import AppLoader from '@/components/AppLoader.vue'
import GasPrice from '@/components/GasPrice.vue'
import SendNftPreview from '@/components/SendNftPreview.vue'
import { type NFTContractType, type NFT } from '@/models/NFT'
import { useActivitiesStore } from '@/store/activities'
import { EIP1559GasFee } from '@/store/request'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import { getImage } from '@/utils/getImage'
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
const router = useRouter()

const recipientWalletAddress = ref('')
const gas: Ref<EIP1559GasFee | null> = ref(null)
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

watch(gas, () => {
  if (gas.value) {
    const maxFee = new Decimal(gas.value.maxFeePerGas).add(
      gas.value.maxPriorityFeePerGas || 1.5
    )
    const maxFeeInWei = maxFee.mul(1e9)
    gasFeeInEth.value = maxFeeInWei.div(1e18).toString()
  }
})

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
    baseFeePoll = setInterval(fetchBaseFee, 2000)
    const accountHandler = getRequestHandler().getAccountHandler()
    estimatedGas.value = (
      await accountHandler.estimateNftGas(
        props.type,
        props.address,
        userStore.walletAddress,
        recipientWalletAddress.value,
        props.tokenId,
        1000
      )
    ).toString()
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
  baseFee.value = new Decimal(baseGasPrice).div(1e9).toString()
}

function clearForm() {
  recipientWalletAddress.value = ''
  gas.value = null
}

function setHexPrefix(value: string) {
  const hexPrefix = '0x'
  return value.startsWith(hexPrefix) ? value : `${hexPrefix}${value}`
}

async function handleSendToken() {
  showLoader('Sending...')
  try {
    const accountHandler = getRequestHandler().getAccountHandler()
    let gasFees = '0x1'
    if (gas.value) {
      const maxFee = new Decimal(gas.value.maxFeePerGas).add(
        gas.value.maxPriorityFeePerGas || 1.5
      )
      const maxFeeInWei = maxFee.mul(1e9)
      gasFees = maxFeeInWei.toHexadecimal()
    }

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
    } as NFT
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
  gas.value = value
}

async function handleShowPreview() {
  if (!gas.value) {
    gas.value = {
      maxFeePerGas: baseFee.value,
      maxPriorityFeePerGas: String(4),
      gasLimit: 0,
    }
  }
  if (recipientWalletAddress.value && gas.value) {
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
      const maxFee = new Decimal(gas.value.maxFeePerGas).add(
        gas.value.maxPriorityFeePerGas || 1.5
      )
      const maxFeeInWei = maxFee.mul(1e9)
      gasFeeInEth.value = maxFeeInWei.div(1e18).toString()
      showPreview.value = true
    } catch (e) {
      console.error({ e })
      toast.error('Cannot estimate gas fee. Please try again later.')
    } finally {
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
            :gas-prices="gasPrices"
            :base-fee="baseFee"
            :gas-limit="estimatedGas"
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
