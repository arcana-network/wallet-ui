<script setup lang="ts">
import { Decimal } from 'decimal.js'
import { onMounted, onBeforeMount, onUnmounted, ref, Ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

import AppLoader from '@/components/AppLoader.vue'
import GasPrice from '@/components/GasPrice.vue'
import SendNftPreview from '@/components/SendNftPreview.vue'
import { type NFTContractType, type NFT } from '@/models/NFT'
import { NFTDB } from '@/services/nft.service'
import { useActivitiesStore } from '@/store/activities'
import { useAppStore } from '@/store/app'
import { EIP1559GasFee } from '@/store/request'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import { EVMAccountHandler, SolanaAccountHandler } from '@/utils/accountHandler'
import { ChainType } from '@/utils/chainType'
import { getImage } from '@/utils/getImage'
import { getRequestHandler } from '@/utils/requestHandlerSingleton'
import { scwInstance } from '@/utils/scw'
import { getStorage } from '@/utils/storageWrapper'

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
  tokenUrl: string
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
const storage = getStorage()
const appStore = useAppStore()

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
    const maxFeeInWei = maxFee.mul(Decimal.pow(10, 9))
    gasFeeInEth.value = maxFeeInWei.div(Decimal.pow(10, 18)).toString()
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
  if (appStore.chainType !== ChainType.solana_cv25519) {
    showLoader('Loading...')
    try {
      await fetchBaseFee()
      baseFeePoll = setInterval(fetchBaseFee, 2000)
      const accountHandler =
        getRequestHandler().getAccountHandler() as EVMAccountHandler
      estimatedGas.value = (
        await accountHandler.estimateNftGas(
          props.type,
          props.address,
          userStore.walletAddress,
          userStore.walletAddress,
          props.tokenId,
          1000
        )
      ).toString()
    } catch (err) {
      console.log({ err })
    } finally {
      hideLoader()
    }
  }
})

const paymasterBalance = ref(0)
onBeforeMount(async () => {
  if (appStore.chainType === ChainType.evm_secp256k1 && rpcStore.useGasless) {
    paymasterBalance.value = (await scwInstance.getPaymasterBalance()) / 1e18
  }
})

onUnmounted(() => {
  if (baseFeePoll) clearInterval(baseFeePoll)
  if (gasSliderPoll) clearInterval(gasSliderPoll)
})

async function fetchBaseFee() {
  const accountHandler =
    getRequestHandler().getAccountHandler() as EVMAccountHandler
  const baseGasPrice = (await accountHandler.provider.getGasPrice()).toString()
  baseFee.value = new Decimal(baseGasPrice).div(Decimal.pow(10, 9)).toString()
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
  if (props.type === 'erc1155' && quantity.value > (props.balance as number)) {
    toast.error(
      `You don't own enough NFTs to send ${quantity.value} NFTs. You can send ${props.balance} NFTs at most.`
    )
    return
  }
  if (!recipientWalletAddress.value) {
    toast.error('Please enter a valid wallet address')
    return
  }
  if (props.type === 'erc1155' && (!quantity.value || quantity.value == 0)) {
    toast.error('Please enter a valid quantity')
    return
  }
  showLoader('Sending...')
  try {
    if (appStore.chainType === ChainType.solana_cv25519) {
      const accountHandler =
        getRequestHandler().getAccountHandler() as SolanaAccountHandler
      const signature = await accountHandler.sendCustomToken({
        mint: props.tokenId,
        to: recipientWalletAddress.value,
        amount: '1',
        decimals: 0,
      })
      const nft = {
        ...props,
      } as NFT
      await activitiesStore.fetchAndSaveNFTActivityFromHash({
        txHash: signature,
        chainId: rpcStore.selectedRpcConfig?.chainId as string,
        nft,
        recipientAddress: recipientWalletAddress.value,
        chainType: ChainType.solana_cv25519,
      })
      toast.success('Tokens sent Successfully')
    } else {
      const accountHandler =
        getRequestHandler().getAccountHandler() as EVMAccountHandler
      let gasFees = '0x1'
      if (gas.value) {
        const maxFee = new Decimal(gas.value.maxFeePerGas).add(
          gas.value.maxPriorityFeePerGas || 1.5
        )
        const maxFeeInWei = maxFee.mul(Decimal.pow(10, 9))
        gasFees = maxFeeInWei.toHexadecimal()
      }

      const txHash = await accountHandler.sendNft(
        props.type,
        props.address,
        userStore.walletAddress,
        setHexPrefix(recipientWalletAddress.value),
        props.tokenId,
        quantity.value || 1,
        gasFees,
        estimatedGas.value
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
      toast.success('Tokens sent Successfully')
      const nftDb = await NFTDB.create(storage.local, userStore.walletAddress)
      if (props.type === 'erc1155') {
        nftDb.updateNFT(
          {
            ...props,
            balance: props.balance ? props.balance - quantity.value : undefined,
            attributes: props.attributes ? JSON.parse(props.attributes) : [],
          },
          Number(rpcStore.selectedRpcConfig?.chainId)
        )
      } else {
        nftDb.removeNFT(
          {
            ...props,
            attributes: props.attributes ? JSON.parse(props.attributes) : [],
          },
          Number(rpcStore.selectedRpcConfig?.chainId)
        )
      }
    }
    router.push({ name: 'Nfts' })
  } catch (error: any) {
    const displayMessage =
      ((error?.data?.originalError?.error?.message ||
        error?.data?.originalError?.reason ||
        error?.data?.originalError?.code ||
        error?.error?.message ||
        error?.message ||
        error?.reason) as string) || 'Something went wrong'
    toast.error(displayMessage)
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
  if (props.type === 'erc1155' && quantity.value > (props.balance as number)) {
    toast.error(
      `You don't own enough NFTs to send ${quantity.value} NFTs. You can send ${props.balance} NFTs at most.`
    )
    return
  }
  if (!recipientWalletAddress.value) {
    toast.error('Please enter a valid wallet address')
    return
  }
  if (props.type === 'erc1155' && (!quantity.value || quantity.value == 0)) {
    toast.error('Please enter a valid quantity')
    return
  }
  if (appStore.chainType === ChainType.solana_cv25519) {
    showPreview.value = true
    return
  }
  if (new Decimal(rpcStore.walletBalance).lessThanOrEqualTo(0)) {
    toast.error('Insufficient gas balance')
    return
  }
  if (recipientWalletAddress.value && gas.value) {
    showLoader('Loading preview...')
    try {
      const accountHandler =
        getRequestHandler().getAccountHandler() as EVMAccountHandler
      estimatedGas.value = (
        await accountHandler.estimateNftGas(
          props.type,
          props.address,
          userStore.walletAddress,
          recipientWalletAddress.value,
          props.tokenId,
          quantity.value || 1
        )
      ).toString()
      const maxFee = new Decimal(gas.value.maxFeePerGas).add(
        gas.value.maxPriorityFeePerGas || 1.5
      )
      const maxFeeInWei = maxFee.mul(Decimal.pow(10, 9))
      gasFeeInEth.value = maxFeeInWei.div(Decimal.pow(10, 18)).toString()
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

watch(
  () => rpcStore.selectedChainId,
  () => {
    router.replace({ name: 'Nfts' })
  }
)
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
            v-if="
              appStore.chainType !== ChainType.solana_cv25519 &&
              (!rpcStore.useGasless ||
                (rpcStore.useGasless && paymasterBalance < 0.1))
            "
            :gas-prices="gasPrices"
            :base-fee="baseFee"
            :gas-limit="estimatedGas"
            @gas-price-input="handleSetGasPrice"
          />
          <span
            v-else-if="rpcStore.useGasless && paymasterBalance >= 0.1"
            class="text-xs text-green-100 font-medium text-center w-full"
            >This is a Gasless Transaction. Click Below to Approve.
          </span>
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
