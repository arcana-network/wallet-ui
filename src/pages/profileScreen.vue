<script setup lang="ts">
import { ethers } from 'ethers'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import type { Ref } from 'vue'
import { useToast } from 'vue-toastification'

import SendTokens from '@/components/SendTokens.vue'
import { getExchangeRate } from '@/services/exchangeRate.service'
import type { CurrencySymbol } from '@/services/exchangeRate.service'
import { useModalStore } from '@/store/modal'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import { AccountHandler } from '@/utils/accountHandler'
import { truncateToTwoDecimals } from '@/utils/truncateToTwoDecimal'
import { useImage } from '@/utils/useImage'

const EXCHANGE_RATE_CURRENCY: CurrencySymbol = 'USD'
type ModalState = 'send' | 'receive' | false

const showModal: Ref<ModalState> = ref(false)
const getImage = useImage()
const userStore = useUserStore()
const rpcStore = useRpcStore()
const modalStore = useModalStore()
const walletBalance = ref('')
const toast = useToast()
const exchangeRate: Ref<number | null> = ref(null)
const { rpcConfig, currency } = storeToRefs(rpcStore)
const loader = ref({
  show: false,
  message: '',
})

onMounted(async () => {
  await getWalletBalance()
  await getCurrencyExchangeRate()
})

function showLoader(message) {
  loader.value.show = true
  loader.value.message = `${message}...`
}

function hideLoader() {
  loader.value.show = false
  loader.value.message = ''
}

async function getCurrencyExchangeRate() {
  showLoader('Fetching Currency Rate')
  try {
    if (currency.value) {
      const rate = await getExchangeRate(
        currency.value as CurrencySymbol,
        EXCHANGE_RATE_CURRENCY
      )
      if (rate) exchangeRate.value = rate
    }
  } catch (err) {
    console.error(err)
    exchangeRate.value = null
  } finally {
    hideLoader()
  }
}

const totalAmountInUSD = computed(() => {
  if (exchangeRate.value) {
    return Math.round(Number(walletBalance.value) * exchangeRate.value)
  }
  return ''
})

async function getWalletBalance() {
  showLoader('Fetching Wallet Balance')
  try {
    const accountHandler = new AccountHandler(userStore.privateKey)
    const balance = await accountHandler.provider.getBalance(
      userStore.walletAddress
    )
    rpcStore.setWalletBalance(balance.toString())
    walletBalance.value = ethers.utils.formatEther(balance.toString())
  } catch (err) {
    console.log({ err })
  } finally {
    hideLoader
  }
}

async function copyToClipboard(value: string) {
  try {
    await navigator.clipboard.writeText(value)
    toast.success('Wallet address copied')
  } catch (err) {
    toast.error('Failed to copy wallet address')
  }
}

function openSendTokens(open) {
  modalStore.setShowModal(open)
  showModal.value = open ? 'send' : false
}

function openReceiveTokens(open) {
  modalStore.setShowModal(open)
  showModal.value = open ? 'receive' : false
}
</script>

<template>
  <div v-if="loader.show" class="flex justify-center items-center h-full">
    <p>{{ loader.message }}</p>
  </div>
  <div
    v-else
    class="p-4 sm:p-2 h-full flex flex-col justify-between space-y-5 sm:space-y-3 overflow-auto"
  >
    <div class="flex flex-col justify-center items-center space-y-2">
      <p class="text-xl sm:text-sm truncate w-full text-center">
        {{ userStore.info.name || userStore.info.email }}
      </p>
      <div class="flex items-center space-x-1">
        <p class="text-xs">{{ userStore.walletAddressShrinked }}</p>
        <button class="h-3" @click="copyToClipboard(userStore.walletAddress)">
          <img :src="getImage('copy-icon')" alt="copy icon" class="h-full" />
        </button>
      </div>
    </div>
    <div class="space-y-1">
      <p class="text-xs text-zinc-400">Network</p>
      <p class="text-base sm:text-sm rounded-lg p-3 sm:p-1 bg-gradient">
        {{ rpcConfig.chainName }}
      </p>
    </div>
    <div
      class="w-36 h-36 sm:w-28 sm:h-28 rounded-full mx-auto flex flex-col justify-center items-center space-y-2 sm:space-y-0"
    >
      <p class="text-sm sm:text-xs">Total Balance</p>
      <div
        v-if="exchangeRate"
        class="space-y-2 sm:space-y-0 flex flex-col items-center"
      >
        <p class="text-2xl sm:text-base text-center">
          {{ `$${totalAmountInUSD}` }}
        </p>
        <div class="flex text-zinc-400 text-sm space-x-1">
          <p>{{ truncateToTwoDecimals(walletBalance) }}</p>
          <p>{{ currency }}</p>
        </div>
      </div>
      <div v-else>
        <div class="flex text-2xl sm:text-base space-x-1">
          <p>{{ truncateToTwoDecimals(walletBalance) }}</p>
          <p>{{ currency }}</p>
        </div>
      </div>
    </div>
    <div class="flex space-x-3">
      <button
        class="text-sm sm:text-xs rounded-xl text-white dark:bg-white bg-black dark:text-black flex-1"
        @click="openSendTokens(true)"
      >
        Send
      </button>
      <button
        class="text-sm sm:text-xs rounded-xl border-2 border-solid border-black dark:border-white flex-1"
        @click="openReceiveTokens(true)"
      >
        Receive
      </button>
    </div>
    <Teleport v-if="showModal" to="#modal-container">
      <SendTokens v-if="showModal === 'send'" @close="openSendTokens(false)" />
    </Teleport>
  </div>
</template>
