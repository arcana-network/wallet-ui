<script setup lang="ts">
import { useToast } from 'vue-toastification'

import { useAppStore } from '@/store/app'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import { useImage } from '@/utils/useImage'

const QRious = window.QRious

const getImage = useImage()
const emits = defineEmits(['close'])

const rpcStore = useRpcStore()
const userStore = useUserStore()
const appStore = useAppStore()
const toast = useToast()

function renderQrCode(element) {
  new QRious({
    element,
    value: userStore.walletAddress,
    level: 'H',
    size: 300,
    background: appStore.theme === 'dark' ? 'white' : 'black',
    foreground: appStore.theme === 'dark' ? 'black' : 'white',
  })
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
  <div class="space-y-2 max-h-full flex flex-col justify-between">
    <div class="space-y-1">
      <div class="flex items-center justify-between">
        <p class="text-xl sm:text-sm">Receive Tokens</p>
        <button class="h-auto" @click="emits('close')">
          <img :src="getImage('close-icon')" alt="close icon" class="sm:h-2" />
        </button>
      </div>
      <p class="text-xs text-zinc-400">
        Scan QR code to copy your address in order to send tokens to this
        address.
      </p>
    </div>
    <div class="space-y-1 space-x-2 flex justify-center items-baseline">
      <p class="text-xs text-zinc-400">Network:</p>
      <p class="text-base sm:text-[12px]">
        {{ rpcStore.rpcConfig?.chainName }}
      </p>
    </div>
    <div class="flex justify-center items-center">
      <canvas
        :ref="renderQrCode"
        class="rounded-md sm:w-36 sm:h-36 p-3 dark:bg-white bg-black"
      ></canvas>
    </div>
    <div class="flex flex-col items-center">
      <div class="flex space-x-1">
        <p class="text-xs">{{ userStore.walletAddressShrinked }}</p>
        <button class="h-3" @click="copyToClipboard(userStore.walletAddress)">
          <img :src="getImage('copy-icon')" alt="copy icon" class="h-full" />
        </button>
      </div>
    </div>
  </div>
</template>
