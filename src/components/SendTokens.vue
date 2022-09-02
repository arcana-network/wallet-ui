<script setup lang="ts">
import { ethers } from 'ethers'
import { ref } from 'vue'

import GasPrice from '@/components/GasPrice.vue'
import SendTokensPreview from '@/components/SendTokensPreview.vue'
import { useRpcStore } from '@/store/rpc'
import { useImage } from '@/utils/useImage'

const emits = defineEmits(['close'])

const showPreview = ref(false)
const rpcStore = useRpcStore()
const getImage = useImage()

const recipientWalletAddress = ref('')
const amount = ref('')
const gasFees = ref('')

const walletbalance = ethers.utils.formatEther(rpcStore.walletbalance)

function handleSendToken() {
  console.log('send tokens')
}

function handleSetGasPrice() {
  console.log('handleSetGasPrice')
}
</script>

<template>
  <SendTokensPreview
    v-if="showPreview"
    @close="showPreview = false"
    @submit="handleSendToken"
  />
  <div
    v-else
    class="container space-y-3 rounded-lg overflow-auto h-full min-w-full p-3 sm:p-2 flex flex-col justify-between"
  >
    <div class="flex flex-col space-y-3 sm:space-y-2">
      <div class="flex justify-between">
        <p class="text-xl sm:text-sm">Send Tokens</p>
        <button class="h-auto" @click="emits('close')">
          <img :src="getImage('close-icon')" alt="close icon" />
        </button>
      </div>
      <p class="text-xs text-zinc-400">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor
      </p>
    </div>
    <div class="space-y-1">
      <p class="text-xs text-zinc-400">Network</p>
      <p class="text-base sm:text-sm">Ethereum</p>
    </div>
    <form class="space-y-4 sm:space-y-3" @submit.prevent="showPreview = true">
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
            <span class="text-white">{{ walletbalance }}</span>
          </p>
        </div>
        <div class="flex divide-x space-x-1 p-2 sm:p-1 bg-gradient rounded-lg">
          <input
            id="amount"
            v-model="amount"
            required
            type="text"
            class="text-base sm:text-sm bg-gradient w-full rounded-lg border-none outline-none"
            placeholder="0.5"
          />
          <select name="choice" class="bg-gradient pr-2 outline-none">
            <option value="eth" select>ETH</option>
            <option value="matic">MATIC</option>
            <option value="xar">XAR</option>
          </select>
        </div>
      </div>
      <GasPrice />
      <div class="flex justify-center">
        <button
          class="text-sm sm:text-xs rounded-xl text-white dark:bg-white bg-black dark:text-black w-36 h-9 sm:w-20 sm:h-8"
        >
          Proceed
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
