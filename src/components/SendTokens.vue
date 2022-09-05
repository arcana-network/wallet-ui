<script setup lang="ts">
import { ethers } from 'ethers'
import { onMounted, ref, Ref } from 'vue'
import { useToast } from 'vue-toastification'

import GasPrice from '@/components/GasPrice.vue'
import SendTokensPreview from '@/components/SendTokensPreview.vue'
import { getGasPrice } from '@/services/gasPrice.service'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import { AccountHandler } from '@/utils/accountHandler'
import { truncateToTwoDecimals } from '@/utils/truncateToTwoDecimal'
import { useImage } from '@/utils/useImage'

const emits = defineEmits(['close'])

const showPreview = ref(false)
const rpcStore = useRpcStore()
const userStore = useUserStore()
const getImage = useImage()
const toast = useToast()

const recipientWalletAddress = ref('')
const amount = ref('')
const gasFee = ref('')
const gasPrices: Ref<object> = ref({})
const loader = ref({
  show: false,
  message: '',
})

const walletbalance = ethers.utils.formatEther(rpcStore.walletbalance)

function showLoader(message) {
  loader.value.show = true
  loader.value.message = `${message}...`
}

function hideLoader() {
  loader.value.show = false
  loader.value.message = ''
}

onMounted(async () => {
  showLoader('Loading')
  try {
    const data = await getGasPrice()
    gasPrices.value = data
  } catch (err) {
    console.log({ err })
    gasPrices.value = {}
  } finally {
    hideLoader()
  }
})

function clearForm() {
  recipientWalletAddress.value = ''
  amount.value = ''
  gasFee.value = ''
}

async function handleSendToken() {
  showLoader('Sending')
  try {
    const payload = {
      to: `0x${recipientWalletAddress.value}`,
      value: ethers.utils.parseEther(`${amount.value}`).toHexString(),
      gasPrice: Number(gasFee.value),
      from: userStore.walletAddress,
    }
    const accountHandler = new AccountHandler(userStore.privateKey)
    await accountHandler.requestSendTransaction(payload)
    toast.success('Tokens sent Successfully')
  } catch (err: object) {
    if (err && err.reason) {
      toast.error(err.reason)
    }
  } finally {
    showPreview.value = false
    hideLoader()
    clearForm()
  }
}

function handleSetGasPrice(value) {
  gasFee.value = value
}

function handleShowPreview() {
  if (recipientWalletAddress.value && amount.value && gasFee.value) {
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
    <SendTokensPreview
      v-if="showPreview"
      :preview-data="{
        senderWalletAddress: userStore.walletAddress,
        recipientWalletAddress: `Ox${recipientWalletAddress}`,
        amount,
        gasFee,
      }"
      @close="showPreview = false"
      @submit="handleSendToken"
    />
    <div v-else class="space-y-3 overflow-auto flex flex-col justify-between">
      <div class="flex flex-col space-y-3 sm:space-y-2">
        <div class="flex justify-between">
          <p class="text-xl sm:text-sm">Send Tokens</p>
          <button class="h-auto" @click="emits('close')">
            <img :src="getImage('close-icon')" alt="close icon" />
          </button>
        </div>
        <p class="text-xs text-zinc-400">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor
        </p>
      </div>
      <div class="space-y-1">
        <p class="text-xs text-zinc-400">Network</p>
        <p class="text-base sm:text-sm">{{ rpcStore.rpcConfig?.chainName }}</p>
      </div>
      <form class="space-y-4 sm:space-y-3" @submit.prevent="handleShowPreview">
        <div class="space-y-1">
          <label class="text-xs text-zinc-400" for="recipientWalletAddress">
            Recipient’s Wallet Address
          </label>
          <input
            id="recipientWalletAddress"
            v-model="recipientWalletAddress"
            required
            type="text"
            class="text-base sm:text-sm bg-gradient w-full p-2 sm:p-1 rounded-lg border-none outline-none"
            placeholder="6yhjtikn7..."
          />
        </div>
        <div class="space-y-1">
          <div class="flex justify-between sm:flex-col sm:space-y-1">
            <label class="text-xs text-zinc-400" for="amount"> Amount </label>
            <p class="space-x-1 text-xs text-zinc-400">
              <span>Total Balance:</span>
              <span class="text-white">{{
                truncateToTwoDecimals(walletbalance)
              }}</span>
            </p>
          </div>
          <div class="flex space-x-1 p-2 sm:p-1 bg-gradient rounded-lg">
            <input
              id="amount"
              v-model="amount"
              autocomplete="off"
              required
              type="text"
              class="text-base sm:text-sm bg-gradient w-full rounded-lg border-none outline-none"
              placeholder="0.5"
            />
            <div
              v-if="rpcStore.currency"
              class="p-2"
              :class="{
                'border-l-[1px] border-l-slate-400 px-1': rpcStore.currency,
              }"
            >
              <p class="text-sm pl-1">{{ rpcStore.currency }}</p>
            </div>
          </div>
        </div>
        <GasPrice
          :gas-prices="gasPrices"
          @gas-price-input="handleSetGasPrice"
        />
        <div class="flex justify-center">
          <button
            class="text-sm sm:text-xs rounded-xl text-white dark:bg-white bg-black dark:text-black w-36 h-9 sm:w-20 sm:h-8"
          >
            Proceed
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
