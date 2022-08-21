<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import { AccountHandler } from '@/utils/accountHandler'
import { useImage } from '@/utils/useImage'

const getImage = useImage()
const userStore = useUserStore()
const rpcStore = useRpcStore()
const walletBalance = ref('')

onMounted(getWalletBalance)

async function getWalletBalance() {
  const accountHandler = new AccountHandler(userStore.privateKey)
  const balance = await accountHandler.provider.getBalance(
    userStore.walletAddress
  )
  walletBalance.value = balance.toString()
}
</script>

<template>
  <div class="px-4 py-5 h-full flex flex-col justify-between space-y-5">
    <div class="flex flex-col justify-center items-center space-y-2">
      <p class="text-xl">{{ userStore.info.name }}</p>
      <div class="flex items-center space-x-1">
        <p class="text-xs">{{ userStore.walletAddressShrinked }}</p>
        <button class="h-3">
          <img :src="getImage('copy-icon')" alt="copy icon" class="h-full" />
        </button>
      </div>
    </div>
    <div class="space-y-1">
      <p class="text-xs text-zinc-400">Network</p>
      <p
        class="text-base rounded-lg p-3 bg-gradient-light dark:bg-gradient-dark"
      >
        {{ rpcStore.rpcConfig.chainName }}
      </p>
    </div>
    <div
      class="w-36 h-36 rounded-full mx-auto flex flex-col justify-center items-center glow-light bg-gradient-light dark:glow-dark dark:bg-gradient-dark"
    >
      <p class="text-sm">Total Balance</p>
      <p class="text-2xl">{{ walletBalance }}</p>
    </div>
    <div class="flex space-x-3">
      <button
        class="text-sm rounded-xl text-white dark:bg-white bg-black dark:text-black flex-1"
      >
        Send
      </button>
      <button
        class="text-sm rounded-xl border-2 border-solid border-black dark:border-white flex-1"
      >
        Receive
      </button>
    </div>
  </div>
</template>
