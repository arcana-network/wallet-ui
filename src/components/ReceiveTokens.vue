<script setup lang="ts">
import VueQrious from 'vue-qrious'
import { useToast } from 'vue-toastification'

import { useUserStore } from '@/store/user'
import { content, errors } from '@/utils/content'
import { getImage } from '@/utils/getImage'

const userStore = useUserStore()
const toast = useToast()

async function copyToClipboard(value: string) {
  try {
    await navigator.clipboard.writeText(value)
    toast.success(content.WALLET.COPY)
  } catch (err) {
    toast.error(errors.WALLET.COPY)
  }
}
</script>

<template>
  <div class="flex flex-col">
    <div class="flex items-center justify-center">
      <p class="text-xl font-bold">Receive Tokens</p>
    </div>
    <p class="text-xs text-gray-100 mt-5">
      Scan QR code to copy your address in order to send tokens to this address.
    </p>
  </div>
  <div
    class="flex justify-center items-center mt-4 p-2 bg-white-100 rounded-sm"
  >
    <VueQrious
      :value="userStore.walletAddress"
      :size="400"
      class="w-full h-full"
    />
  </div>
  <div class="flex items-center justify-center gap-1 mt-6 mb-2">
    <p class="text-sm font-medium">{{ userStore.walletAddressShrinked }}</p>
    <button
      class="h-sm w-sm"
      title="Click to copy wallet address"
      @click="copyToClipboard(userStore.walletAddress)"
    >
      <img :src="getImage('copy.svg')" alt="Copy wallet address" />
    </button>
  </div>
</template>
