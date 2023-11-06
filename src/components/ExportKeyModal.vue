<script setup lang="ts">
import { useToast } from 'vue-toastification'

import { downloadFile } from '@/utils/downloadFile'
import { getImage } from '@/utils/getImage'

const toast = useToast()

type ExportKeyModalProps = {
  privateKey: string
  walletAddress: string
}

const props = defineProps<ExportKeyModalProps>()

function handlePrivateKeyDownload(privateKey, walletAddress) {
  const fileData = new Blob([privateKey], {
    type: 'text/plain',
  })
  downloadFile(`${walletAddress}-private-key.txt`, fileData)
}

async function copyToClipboard(value: string, message: string) {
  try {
    await navigator.clipboard.writeText(value)
    toast.success(message)
  } catch (err) {
    toast.error('Failed to copy')
  }
}
</script>

<template>
  <div class="flex flex-col space-y-5">
    <div class="flex flex-col gap-1">
      <div class="flex items-center justify-between">
        <label class="text-sm font-semibold text-[#8D8D8D]">Private Key</label>
      </div>
      <div>
        <div
          class="bg-[#121212] rounded-md p-4 break-words font-normal text-base"
        >
          {{ props.privateKey }}
        </div>
      </div>
    </div>
    <div class="flex gap-8 justify-center">
      <button
        class="flex gap-1 items-center justify-center btn-tertiary text-sm font-medium p-2"
        @click.stop="copyToClipboard(props.privateKey, 'Private Key Copied')"
      >
        <img :src="getImage('copy.svg')" class="w-lg h-lg" />
        <span>Copy</span>
      </button>
      <button
        class="flex gap-1 items-center justify-center btn-tertiary text-sm font-medium p-2"
        @click.stop="
          handlePrivateKeyDownload(props.privateKey, props.walletAddress)
        "
      >
        <img :src="getImage('download.svg')" class="w-lg h-lg" />
        <span>Download</span>
      </button>
    </div>
    <div class="flex space-x-3 bg-[#313131] p-2 rounded-sm">
      <img class="w-5 h-5" src="@/assets/images/info-circle.svg" />
      <span class="text-xs">
        Please close this tab immediately after you back up your private key!
      </span>
    </div>
  </div>
</template>
