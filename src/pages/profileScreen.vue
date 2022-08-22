<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'

import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import { AccountHandler } from '@/utils/accountHandler'
import { useImage } from '@/utils/useImage'

const getImage = useImage()
const userStore = useUserStore()
const rpcStore = useRpcStore()
const walletBalance = ref('')
const toast = useToast()

onMounted(getWalletBalance)

async function getWalletBalance() {
  const accountHandler = new AccountHandler(userStore.privateKey)
  const balance = await accountHandler.provider.getBalance(
    userStore.walletAddress
  )
  walletBalance.value = balance.toString()
}

async function copyToClipboard(value: string) {
  try {
    await navigator.clipboard.writeText(value)
    toast.success('Wallet address copied')
  } catch (err) {
    toast.error('Failed to copy wallet address')
  }
}
</script>

<template>
  <div
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
      <p
        class="text-base sm:text-sm rounded-lg p-3 sm:p-1 bg-gradient-light dark:bg-gradient-dark"
      >
        {{ rpcStore.rpcConfig.chainName }}
      </p>
    </div>
    <div
      class="w-36 h-36 sm:w-24 sm:h-24 rounded-full mx-auto flex flex-col justify-center items-center glow-light bg-gradient-light dark:glow-dark dark:bg-gradient-dark"
    >
      <p class="text-sm sm:text-xs">Total Balance</p>
      <p class="text-2xl sm:text-base">{{ walletBalance }}</p>
    </div>
    <div class="flex space-x-3">
      <button
        class="text-sm sm:text-xs rounded-xl text-white dark:bg-white bg-black dark:text-black flex-1"
      >
        Send
      </button>
      <button
        class="text-sm sm:text-xs rounded-xl border-2 border-solid border-black dark:border-white flex-1"
      >
        Receive
      </button>
    </div>
  </div>
</template>
