<script setup lang="ts">
import QRious from 'qrious'
import { onMounted } from 'vue'
import { useToast } from 'vue-toastification'

import { useAppStore } from '@/store/app'
import { useUserStore } from '@/store/user'
import { useImage } from '@/utils/useImage'

defineProps({
  chainName: {
    type: String,
    required: true,
  },
})

onMounted(() => {
  renderQRCode(userStore.walletAddress, appStore.theme)
})

function renderQRCode(walletAddress, theme) {
  new QRious({
    element: document.getElementById('qrcode'),
    value: walletAddress,
    background: theme === 'dark' ? 'white' : 'black',
    foreground: theme === 'dark' ? 'black' : 'white',
    size: '300',
  })
}

const getImage = useImage()
const emits = defineEmits(['close'])
const userStore = useUserStore()
const appStore = useAppStore()
const toast = useToast()

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
    class="container space-y-4 sm:space-y-3 rounded-lg overflow-auto h-full min-w-full p-3 sm:p-2 flex flex-col"
  >
    <div>
      <div class="flex items-center justify-between">
        <p class="text-xl sm:text-sm">Receive Tokens</p>
        <button @click="emits('close')">
          <img :src="getImage('close-icon')" alt="close icon" />
        </button>
      </div>
      <p class="text-xs text-zinc-400">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor
      </p>
    </div>
    <div class="flex-1 space-y-4">
      <div class="space-x-1 flex items-center justify-center">
        <p class="text-xs text-zinc-400">Network:</p>
        <p class="text-base sm:text-sm">{{ chainName }}</p>
      </div>
      <div class="flex justify-center">
        <canvas
          id="qrcode"
          class="rounded-md w-60 h-60 sm:w-28 sm:h-28"
        ></canvas>
      </div>
      <div class="flex items-center justify-center space-x-1">
        <p class="text-xs">{{ userStore.walletAddressShrinked }}</p>
        <button class="h-3" @click="copyToClipboard(userStore.walletAddress)">
          <img :src="getImage('copy-icon')" alt="copy icon" class="h-full" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  background: var(--content-bg-color);
  box-shadow: 4px 5px 4px rgb(0 0 0 / 25%);
}
</style>
