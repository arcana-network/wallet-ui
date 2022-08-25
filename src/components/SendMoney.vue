<script setup lang="ts">
import { ethers } from 'ethers'
import { onMounted, ref } from 'vue'

import { getGasPrice } from '@/services/gasPrice.service'
import { useUserStore } from '@/store/user'
import { AccountHandler } from '@/utils/accountHandler'

const senderWalletAddress = ref(null)
const amount = ref(null)
const gasPrice = ref(null)
const userStore = useUserStore()

const { walletAddress, privateKey } = userStore

onMounted(async () => {
  gasPrice.value = await getGasPrice()
})

const emits = defineEmits(['close'])

defineProps({
  chainName: {
    type: String,
    required: true,
  },
})

async function sendTokens() {
  try {
    const payload = {
      to: `0x${senderWalletAddress.value}`,
      value: ethers.utils.parseEther(`${amount.value}`).toHexString(),
      gasPrice: gasPrice.value,
      from: walletAddress,
    }
    console.log({ payload })
    const accountHandler = new AccountHandler(privateKey)
    const response = await accountHandler.requestSendTransaction(payload)
    console.log({ response })
  } catch (err) {
    console.log({ err })
  }
}
</script>

<template>
  <div
    class="container space-y-4 sm:space-y-3 rounded-lg overflow-auto h-full min-w-full p-3 sm:p-2 flex flex-col justify-between"
  >
    <div class="space-y-1">
      <p class="text-xl sm:text-sm">Send Tokens</p>
      <p class="text-xs text-zinc-400">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor
      </p>
    </div>
    <div class="space-y-1">
      <p class="text-xs text-zinc-400">Network</p>
      <p class="text-base sm:text-sm">{{ chainName }}</p>
    </div>
    <form class="space-y-4 sm:space-y-3" @submit.prevent="sendTokens">
      <div class="space-y-1">
        <label class="text-xs text-zinc-400" for="recipientWalletAddress"
          >Recipient’s Wallet Address</label
        >
        <input
          id="recipientWalletAddress"
          v-model="senderWalletAddress"
          required
          type="text"
          class="text-base sm:text-sm bg-gradient w-full p-2 sm:p-1 rounded-lg border-none outline-none"
          placeholder="6yhjtikn7...."
        />
      </div>
      <div class="space-y-1">
        <label class="text-xs text-zinc-400" for="amount">Amount</label>
        <input
          id="amount"
          v-model="amount"
          required
          type="text"
          class="text-base sm:text-sm bg-gradient w-full p-2 sm:p-1 rounded-lg border-none outline-none appearance-none"
          placeholder="Ex: 0.5 ETH"
        />
      </div>
      <div class="space-y-1">
        <label class="text-xs text-zinc-400" for="gasPrice">Gas Price</label>
        <p class="text-xs text-zinc-400">
          Fees paid to validators and refer Polygon Gastation for recent prices
        </p>
        <input
          id="gasPrice"
          v-model="gasPrice"
          required
          type="text"
          class="text-base sm:text-sm bg-gradient w-full p-2 sm:p-1 rounded-lg border-none outline-none"
          placeholder="Ex: $3.50"
        />
      </div>
      <div class="flex space-x-3">
        <button
          class="text-sm rounded-xl border-2 border-solid border-black dark:border-white flex-1"
          @click="emits('close')"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="text-sm rounded-xl text-white dark:bg-white bg-black dark:text-black flex-1"
        >
          Send
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.container {
  background: var(--content-bg-color);
  box-shadow: 4px 5px 4px rgb(0 0 0 / 25%);
}
</style>
