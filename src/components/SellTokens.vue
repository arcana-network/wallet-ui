<script setup lang="ts">
import { ref, type Ref } from 'vue'

import AppLoader from '@/components/AppLoader.vue'
import { openTransak } from '@/utils/transak'
import { useImage } from '@/utils/useImage'

const getImage = useImage()

type SellTokenProps = {
  transakNetwork?: string
}

const props = defineProps<SellTokenProps>()

const emit = defineEmits(['close'])
const selectedProvider: Ref<'transak' | ''> = ref('')
const isLoading = ref(false)
const showStatusModal: Ref<'success' | 'failed' | 'cancelled' | ''> = ref('')
const statusText = ref({
  title: '',
  message: '',
})

function handleTransak() {
  isLoading.value = true
  openTransak(props.transakNetwork as string, true)
  handleStatusModalText('Transak')
}

function handleStatusModalText(provider: 'Transak') {
  setTimeout(() => {
    isLoading.value = false
  }, 1500)
  showStatusModal.value = 'success'
  statusText.value = {
    title: `You selected ${provider}`,
    message:
      'Your sell transaction is in progress in another browser tab. Meanwhile, you can close this popup and resume wallet access.',
  }
}

function handleBuy() {
  if (selectedProvider.value === 'transak') {
    handleTransak()
  }
}

function handleDone() {
  if (showStatusModal.value === 'success') {
    return emit('close')
  }
  showStatusModal.value = ''
  statusText.value = {
    title: '',
    message: '',
  }
}
</script>

<template>
  <div>
    <AppLoader v-if="isLoading" message="Processing..." />
    <div
      v-else-if="showStatusModal"
      class="overflow-auto flex flex-col gap-4 justify-between p-2"
    >
      <img src="@/assets/images/success.svg" class="h-16 w-16 self-center" />
      <div class="flex flex-col gap-2">
        <div class="text-base font-medium text-center">
          {{ statusText.title }}
        </div>
        <div class="text-sm text-gray-100 text-center">
          {{ statusText.message }}
        </div>
      </div>
    </div>
    <div v-else class="flex flex-col p-1">
      <div class="flex flex-col gap-3">
        <p class="font-medium text-center text-xl">Select Provider</p>
        <p class="text-xs text-zinc-400">
          You will be taken to the provider website in a different tab once you
          choose the provider and click PROCEED.
        </p>
      </div>
      <form class="flex flex-col mt-5 space-y-4" @submit.prevent="handleBuy">
        <div class="flex flex-col gap-2">
          <div
            class="flex gap-3 p-4 items-center justify-between border border-1 rounded-sm transition-all duration-300 ease-in-out"
            :class="{
              'opacity-60 cursor-not-allowed': !props.transakNetwork,
              'hover:border-gray-100 cursor-pointer': props.transakNetwork,
              'border-black-500 dark:border-gray-100 bg-white-300 dark:bg-black-300':
                selectedProvider === 'transak',
              'border-gray-800 dark:border-gray-200':
                selectedProvider !== 'transak',
            }"
            @click.stop="
              props.transakNetwork ? (selectedProvider = 'transak') : void 0
            "
          >
            <label for="Transak" class="flex gap-2 items-center cursor-pointer">
              <img src="@/assets/images/transak.png" class="h-xl w-xl" />
              <span class="text-base font-normal">Transak</span>
            </label>
            <input
              id="Transak"
              v-model="selectedProvider"
              type="radio"
              value="transak"
              name="provider"
              :disabled="!props.transakNetwork"
              class="radio"
            />
          </div>
        </div>
        <div class="flex space-x-3 bg-blue-dark-sky p-3 rounded-sm">
          <img class="w-4 h-4 mt-1" :src="getImage('info-icon')" />
          <p class="text-xs text-white-200">
            Your wallet address will be auto-filled, please verify. The time
            taken for funds to reflect in the wallet varies based on payment
            method.
          </p>
        </div>
        <div class="flex mt-8">
          <button
            class="flex-1 btn-primary py-[10px] uppercase text-base font-medium"
            :disabled="!selectedProvider?.trim().length"
          >
            Proceed
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
