<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import ModalFullScreen from '@/components/ModalFullScreen.vue'
import SendMoney from '@/components/SendMoney.vue'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import { AccountHandler } from '@/utils/accountHandler'
import { useImage } from '@/utils/useImage'

const getImage = useImage()
const userStore = useUserStore()
const rpcStore = useRpcStore()
const walletBalance = ref('')
const showSendMoney = ref(false)
const showReceiveMoney = ref(false)

const showModal = computed(() => {
  return showSendMoney.value || showReceiveMoney.value
})

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
  <div
    class="p-4 sm:p-2 h-full flex flex-col justify-between space-y-5 sm:space-y-3 overflow-auto"
  >
    <div class="flex flex-col justify-center items-center space-y-2">
      <p class="text-xl sm:text-sm">{{ userStore.info.name }}</p>
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
        class="text-sm rounded-xl text-white dark:bg-white bg-black dark:text-black flex-1"
        @click="showSendMoney = true"
      >
        Send
      </button>
      <button
        class="text-sm rounded-xl border-2 border-solid border-black dark:border-white flex-1"
        @click="showReceiveMoney = true"
      >
        Receive
      </button>
    </div>
  </div>
  <ModalFullScreen v-if="showModal">
    <SendMoney v-if="showSendMoney" @cancel="showSendMoney = false" />
  </ModalFullScreen>
</template>
