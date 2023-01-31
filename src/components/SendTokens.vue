<script setup lang="ts">
import { ethers } from 'ethers'
import { onMounted, onUnmounted, ref, Ref, watch } from 'vue'
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
import { convertGweiToEth } from '@/utils/gweiToEth'
import { getRequestHandler } from '@/utils/requestHandlerSingleton'
import { truncateToTwoDecimals } from '@/utils/truncateToTwoDecimal'
import { useImage } from '@/utils/useImage'

const emits = defineEmits(['close'])

const showPreview = ref(false)
const rpcStore = useRpcStore()
const userStore = useUserStore()
const activitiesStore = useActivitiesStore()
const getImage = useImage()
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
    symbol: rpcStore.nativeCurrency.symbol,
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

  if (tokenInfo?.symbol === rpcStore.nativeCurrency.symbol) {
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
  const contractsDetails = localStorage.getItem(localStoreKey)
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
    if (selectedToken.value.symbol === rpcStore.nativeCurrency.symbol) {
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
    toast.success('Tokens sent Successfully')
  } catch (err: any) {
    if (err && err.reason) {
      toast.error(err.reason)
    }
  } finally {
    showPreview.value = false
    emits('close')
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
  if (recipientWalletAddress.value && amount.value && gasFeeInGwei.value) {
    showLoader('Loading preview...')
    try {
      const accountHandler = getRequestHandler().getAccountHandler()
      if (rpcStore.nativeCurrency.symbol === selectedToken.value.symbol) {
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
  <div v-else class="w-full">
    <SendTokensPreview
      v-if="showPreview"
      :preview-data="{
        senderWalletAddress: userStore.walletAddress,
        recipientWalletAddress: setHexPrefix(recipientWalletAddress),
        amount,
        gasFee: gasFeeInEth,
        selectedToken: selectedToken.symbol,
        estimatedGas,
      }"
      @close="showPreview = false"
      @submit="handleSendToken"
    />
    <div v-else class="space-y-3 overflow-auto flex flex-col justify-between">
      <div class="flex flex-col space-y-3 sm:space-y-2">
        <div class="flex justify-between">
          <p class="text-xl sm:text-sm font-semibold">Send Tokens</p>
          <button class="h-auto" @click="emits('close')">
            <img :src="getImage('close-icon')" alt="close icon" />
          </button>
        </div>
        <p class="text-xs text-zinc-400">
          Transfer tokens to the specified address. Please specify gas while
          transferring.
        </p>
      </div>
      <div class="space-y-1">
        <p class="text-xs text-zinc-400 font-semibold">Network</p>
        <p class="text-base sm:text-sm flex gap-2">
          <img
            :src="getImage(rpcStore.selectedRpcConfig.favicon)"
            class="w-6 h-6"
          />
          {{ rpcStore.selectedRpcConfig?.chainName }}
        </p>
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
        <div class="space-y-1">
          <div class="flex justify-between sm:flex-col sm:space-y-1">
            <label class="text-xs text-zinc-400 font-semibold" for="amount">
              Amount
            </label>
            <p class="space-x-1 text-xs text-zinc-400">
              <span class="font-semibold">Total Balance:</span>
              <span :title="selectedTokenBalance">{{
                truncateToTwoDecimals(selectedTokenBalance)
              }}</span>
            </p>
          </div>
          <div
            class="flex space-x-1 p-2 sm:p-1 input rounded-lg"
            :class="{
              'outline-black dark:outline-white outline-1 outline':
                isAmountFocused,
            }"
          >
            <input
              id="amount"
              v-model="amount"
              autocomplete="off"
              required
              type="text"
              class="text-base sm:text-sm bg-transparent w-full rounded-lg border-none outline-none"
              placeholder="0.5"
              @focus="isAmountFocused = true"
              @blur="isAmountFocused = false"
            />
            <div
              v-if="tokenList.length"
              class="p-2"
              :class="{
                'border-l-[1px] border-l-slate-400 px-1': tokenList.length,
              }"
            >
              <select
                :model-value="selectedToken.symbol"
                name="tokens"
                class="bg-transparent outline-none w-[6ch] text-ellipsis whitespace-nowrap overflow-hidden"
                @focus="isAmountFocused = true"
                @blur="isAmountFocused = false"
                @change="handleTokenChange"
              >
                <option
                  v-for="token in tokenList"
                  :key="token.address"
                  class="text-black hover:text-white"
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
        <div class="flex justify-center">
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
