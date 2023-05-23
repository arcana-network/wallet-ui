<script setup lang="ts">
import { ethers } from 'ethers'
import { onMounted, onUnmounted, ref, Ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

import AppLoader from '@/components/AppLoader.vue'
import GasPrice from '@/components/GasPrice.vue'
import SendTokensPreview from '@/components/SendTokensPreview.vue'
import {
  getGasPrice,
  GAS_AVAILABLE_CHAIN_IDS,
} from '@/services/gasPrice.service'
import { useActivitiesStore } from '@/store/activities'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import { getTokenBalance } from '@/utils/contractUtil'
import { getImage } from '@/utils/getImage'
import { convertGweiToEth } from '@/utils/gweiToEth'
import { getRequestHandler } from '@/utils/requestHandlerSingleton'
import { getStorage } from '@/utils/storageWrapper'

const showPreview = ref(false)
const rpcStore = useRpcStore()
const userStore = useUserStore()
const activitiesStore = useActivitiesStore()
const router = useRouter()
const toast = useToast()
const isWalletAddressFocused = ref(false)
const isAmountFocused = ref(false)
const chainId = Number(rpcStore.selectedChainId)

const recipientWalletAddress = ref('')
const amount = ref('')
const gasFeeInGwei = ref('')
const gasFeeInEth = ref('')
const estimatedGas = ref('0')
const gasPrices: Ref<object> = ref({})
const loader = ref({
  show: false,
  message: '',
})
const tokenList = ref([
  {
    symbol: rpcStore.nativeCurrency?.symbol,
    decimals: 18,
    address: '',
  },
])
const baseFee = ref('0')
const selectedToken = ref(tokenList.value[0])
const selectedTokenBalance = ref('0')

const walletBalance = ethers.utils.formatEther(rpcStore.walletBalance)

watch(
  () => gasFeeInGwei.value,
  () => {
    if (gasFeeInEth.value) {
      gasFeeInEth.value = convertGweiToEth(gasFeeInGwei.value)
    }
  }
)

watch(selectedToken, async () => {
  await fetchTokenBalance()
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
    setTokenList()
    await fetchTokenBalance()
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

async function fetchTokenBalance() {
  const tokenInfo = tokenList.value.find(
    (item) => item.address === selectedToken.value.address
  )

  if (tokenInfo?.symbol === rpcStore.nativeCurrency?.symbol) {
    selectedTokenBalance.value = walletBalance
  } else {
    const balance = await getTokenBalance({
      walletAddress: userStore.walletAddress,
      contractAddress: tokenInfo?.address as string,
    })
    selectedTokenBalance.value = tokenInfo?.decimals
      ? (Number(balance) / Math.pow(10, tokenInfo?.decimals)).toFixed(
          tokenInfo?.decimals
        )
      : balance
  }
}

function setTokenList() {
  const chainId = rpcStore.selectedChainId
  const walletAddress = userStore.walletAddress
  const localStoreKey = `${walletAddress}/${chainId}/asset-contracts`
  const contractsDetails = getStorage().local.getItem(localStoreKey)
  if (contractsDetails) {
    const contracts = JSON.parse(contractsDetails)
    tokenList.value.push(...contracts)
  }
}

function clearForm() {
  recipientWalletAddress.value = ''
  amount.value = ''
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
    if (selectedToken.value.symbol === rpcStore.nativeCurrency?.symbol) {
      const payload = {
        to: setHexPrefix(recipientWalletAddress.value),
        value: ethers.utils.parseEther(`${amount.value}`).toHexString(),
        gasPrice: gasFees,
        from: userStore.walletAddress,
      }

      const txHash = await accountHandler.sendTransaction(
        payload,
        userStore.walletAddress
      )
      activitiesStore.fetchAndSaveActivityFromHash({
        chainId: rpcStore.selectedRpcConfig?.chainId,
        txHash,
      })
    } else {
      const tokenInfo = tokenList.value.find(
        (item) => item.address === selectedToken.value.address
      )
      const sendAmount = tokenInfo?.decimals
        ? `0x${(
            Number(amount.value) * Math.pow(10, tokenInfo.decimals)
          ).toString(16)}`
        : amount.value
      const transactionHash = await accountHandler.sendCustomToken(
        tokenInfo?.address,
        setHexPrefix(recipientWalletAddress.value),
        sendAmount,
        gasFees
      )
      activitiesStore.fetchAndSaveActivityFromHash({
        chainId: rpcStore.selectedRpcConfig?.chainId,
        txHash: transactionHash,
        customToken: {
          operation: 'Send',
          amount: amount.value,
          symbol: tokenInfo?.symbol as string,
        },
        recipientAddress: setHexPrefix(recipientWalletAddress.value),
      })
    }
    clearForm()
    toast.success('Tokens sent Successfully')
  } catch (err: any) {
    if (err && err.reason) {
      toast.error(err.reason)
    }
  } finally {
    showPreview.value = false
    hideLoader()
  }
}

function handleSetGasPrice(value) {
  gasFeeInGwei.value = value
}

async function handleShowPreview() {
  if (!gasFeeInGwei.value) {
    gasFeeInGwei.value = baseFee.value
  }
  if (recipientWalletAddress.value && amount.value && gasFeeInGwei.value) {
    showLoader('Loading preview...')
    try {
      const accountHandler = getRequestHandler().getAccountHandler()
      if (rpcStore.nativeCurrency?.symbol === selectedToken.value.symbol) {
        estimatedGas.value = (
          await accountHandler.provider.estimateGas({
            from: userStore.walletAddress,
            to: setHexPrefix(recipientWalletAddress.value),
            value: ethers.utils.parseUnits(amount.value, 'ether'),
          })
        ).toString()
      } else {
        const tokenInfo = tokenList.value.find(
          (item) => item.address === selectedToken.value.address
        )
        const sendAmount = tokenInfo?.decimals
          ? (Number(amount.value) * Math.pow(10, tokenInfo.decimals)).toString()
          : amount.value
        estimatedGas.value = await accountHandler.estimateCustomTokenGas(
          tokenInfo?.address,
          setHexPrefix(recipientWalletAddress.value),
          `0x${Number(sendAmount).toString(16)}`
        )
      }
    } catch (e) {
      console.error({ e })
    }
    hideLoader()
    showPreview.value = true
  } else {
    toast.error('Please fill all values')
  }
}

function handleTokenChange(e) {
  selectedToken.value = JSON.parse(e.target.value)
}
</script>

<template>
  <div v-if="loader.show" class="h-full flex justify-center items-center">
    <AppLoader :message="loader.message" />
  </div>
  <SendTokensPreview
    v-else-if="showPreview"
    :preview-data="{
      senderWalletAddress: userStore.walletAddress,
      recipientWalletAddress: setHexPrefix(recipientWalletAddress),
      amount,
      gasFee: gasFeeInEth,
      selectedToken: selectedToken.symbol as string,
      estimatedGas,
    }"
    @close="showPreview = false"
    @submit="handleSendToken"
  />
  <div v-else class="flex flex-col justify-between">
    <div class="relative flex justify-center items-center">
      <button class="absolute left-0" @click.stop="router.go(-1)">
        <img :src="getImage('back-arrow.svg')" class="w-6 h-6" />
      </button>
      <span class="text-lg font-bold">Send Token</span>
    </div>
    <form
      class="flex flex-col flex-grow justify-between mt-8"
      @submit.prevent="showPreview = true"
    >
      <div class="flex flex-col gap-7">
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
        <div class="flex gap-2">
          <div class="flex flex-col gap-1">
            <label for="amount" class="text-sm font-medium">Amount</label>
            <div
              class="input-field flex"
              :class="{ 'input-active': isAmountFocused }"
            >
              <input
                id="amount"
                v-model="amount"
                autocomplete="off"
                required
                type="text"
                placeholder="0"
                @focus="isAmountFocused = true"
                @blur="isAmountFocused = false"
              />
              <button
                class="btn-primary uppercase m-1 px-3 py-2 font-medium text-xs"
                type="button"
                @click.stop="void 0"
              >
                Max
              </button>
            </div>
            <div class="text-gray-100 text-xs font-normal">
              Total Balance:
              <span class="text-black-500 dark:text-white-100"
                >{{ Number(selectedTokenBalance) }}
                {{ selectedToken.symbol }}</span
              >
            </div>
          </div>
          <div class="flex flex-col gap-1 flex-grow">
            <label for="tokens" class="text-sm font-medium">Token</label>
            <div v-if="tokenList.length" class="input-field pt-[1px]">
              <select
                :model-value="selectedToken.symbol"
                name="tokens"
                class="pr-0 mr-[10px] w-full"
                @change="handleTokenChange"
              >
                <option
                  v-for="token in tokenList"
                  :key="token.address"
                  :value="JSON.stringify(token)"
                >
                  {{ token.symbol }}
                </option>
              </select>
            </div>
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
</template>
