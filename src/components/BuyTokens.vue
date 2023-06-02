<script setup lang="ts">
import { ref, type Ref } from 'vue'

import AppLoader from '@/components/AppLoader.vue'
import { openOnRampMoneyHostedUI } from '@/utils/onrampmoney.ramp'
import { openTransak } from '@/utils/transak'
import { useImage } from '@/utils/useImage'

type BuyTokenProps = {
  transakNetwork?: string
  onRampMoney: number | false | undefined
}

const props = defineProps<BuyTokenProps>()

const emit = defineEmits(['close'])
const getImage = useImage()
const selectedProvider: Ref<'transak' | 'ramp' | 'onramp.money' | ''> = ref('')
const isLoading = ref(false)
const showStatusModal: Ref<'success' | 'failed' | 'cancelled' | ''> = ref('')
const statusText = ref({
  title: '',
  message: '',
})

function handleTransak() {
  isLoading.value = true
  openTransak(props.transakNetwork as string)
  handleStatusModalText('Transak')
}

function handleStatusModalText(provider: 'Transak' | 'Ramp' | 'onramp.money') {
  setTimeout(() => {
    isLoading.value = false
  }, 1500)
  showStatusModal.value = 'success'
  statusText.value = {
    title: `You selected ${provider}`,
    message:
      'Your buy transaction is in progress in another browser tab. Meanwhile, you can close this popup and resume wallet access.',
  }
}

function handleOnRampMoney() {
  if (props.onRampMoney === undefined || props.onRampMoney === false) {
    throw new Error('!!!')
  }
  isLoading.value = true
  openOnRampMoneyHostedUI(props.onRampMoney)
  handleStatusModalText('onramp.money')
}

function handleBuy() {
  if (selectedProvider.value === 'transak') {
    handleTransak()
  } else if (selectedProvider.value === 'onramp.money') {
    handleOnRampMoney()
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
      class="overflow-auto flex flex-col gap-8 justify-between p-1 pt-5"
    >
      <img src="@/assets/images/success.svg" class="h-16 w-16 self-center" />
      <div class="flex flex-col gap-3">
        <div class="modal-title font-semibold text-center">
          {{ statusText.title }}
        </div>
        <div class="modal-description text-center">
          {{ statusText.message }}
        </div>
      </div>
      <button
        class="text-sm sm:text-xs rounded-xl text-white dark:bg-white bg-black dark:text-black h-9 sm:h-8 uppercase"
        @click.stop="handleDone"
      >
        Close
      </button>
    </div>
    <div v-else class="flex flex-col p-1">
      <div class="flex flex-col gap-3">
        <p class="font-bold text-center text-xl">Select Provider</p>
        <p class="text-xs text-zinc-400">
          You will be taken to the provider website in a different tab once you
          choose the provider and click PROCEED.
        </p>
      </div>
      <form class="flex flex-col gap-2 mt-5" @submit.prevent="handleBuy">
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
        <div
          class="flex gap-3 p-4 items-center justify-between border border-1 rounded-sm transition-all duration-300 ease-in-out"
          :class="{
            'opacity-60 cursor-not-allowed': !props.onRampMoney,
            'hover:border-gray-100 cursor-pointer': props.onRampMoney,
            'border-black-500 dark:border-gray-100 bg-white-300 dark:bg-black-300':
              selectedProvider === 'onramp.money',
            'border-gray-800 dark:border-gray-200':
              selectedProvider !== 'onramp.money',
          }"
          @click.stop="
            props.onRampMoney ? (selectedProvider = 'onramp.money') : void 0
          "
        >
          <label
            for="OnRampMoney"
            class="flex gap-2 items-center cursor-pointer"
            :class="{ 'opacity-50': props.onRampMoney === false }"
          >
            <img
              src="@/assets/images/onrampmoney.png"
              class="h-7 w-7 bg-[#F2F2F2] rounded-full"
            />
            <span class="text-base">onramp.money</span>
          </label>
          <input
            id="OnRampMoney"
            v-model="selectedProvider"
            type="radio"
            value="onramp.money"
            name="provider"
            :disabled="props.onRampMoney === false"
            class="radio"
          />
        </div>
        <div class="flex mt-8">
          <button
            class="flex-1 btn-primary py-[10px] uppercase text-base font-bold"
            :disabled="!selectedProvider?.trim().length"
          >
            Proceed
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
