<script setup lang="ts">
import { ref, type Ref } from 'vue'

import AppLoader from '@/components/AppLoader.vue'
import { openOnRampMoneyHostedUI } from '@/utils/onrampmoney.ramp'
import { openRampSdk } from '@/utils/rampsdk'
import { openTransak } from '@/utils/transak'
import { useImage } from '@/utils/useImage'

type BuyTokenProps = {
  transakNetwork?: string
  rampNetwork?: string
  onRampMoney?: number
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

function handleRamp() {
  isLoading.value = true
  openRampSdk(props.rampNetwork as string)
  handleStatusModalText('Ramp')
}

function handleOnRampMoney() {
  if (props.onRampMoney == null) {
    throw new Error('!!!')
  }
  isLoading.value = true
  openOnRampMoneyHostedUI(props.onRampMoney)
  handleStatusModalText('onramp.money')
}

function handleBuy() {
  if (selectedProvider.value === 'transak') {
    handleTransak()
  } else if (selectedProvider.value === 'ramp') {
    handleRamp()
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
    <div v-else class="overflow-auto flex flex-col justify-between p-1">
      <div class="flex flex-col space-y-3 sm:space-y-2">
        <div class="flex justify-between">
          <p class="text-xl sm:text-sm font-semibold">Select Provider</p>
          <button class="h-auto" @click="emit('close')">
            <img :src="getImage('close-icon')" alt="close icon" />
          </button>
        </div>
        <p class="text-xs text-zinc-400">
          You will be taken to the provider website in a different tab once you
          choose the provider and click PROCEED.
        </p>
      </div>
      <form class="flex flex-col gap-6 mt-8" @submit.prevent="handleBuy">
        <div class="flex gap-3 items-center">
          <input
            id="Transak"
            v-model="selectedProvider"
            type="radio"
            value="transak"
            name="provider"
            :disabled="!props.transakNetwork"
            :class="{ 'opacity-80': !props.transakNetwork }"
          />
          <label
            for="Transak"
            class="flex gap-2 items-center cursor-pointer"
            :class="{ 'opacity-50': !props.transakNetwork }"
          >
            <img src="@/assets/images/transak.png" class="h-7 w-7" />
            <span class="text-base">Transak</span>
          </label>
        </div>
        <div class="flex gap-3 items-center">
          <input
            id="Ramp"
            v-model="selectedProvider"
            type="radio"
            value="ramp"
            name="provider"
            :disabled="!props.rampNetwork"
            :class="{ 'opacity-80': !props.rampNetwork }"
          />
          <label
            for="Ramp"
            class="flex gap-2 items-center cursor-pointer"
            :class="{ 'opacity-50': !props.rampNetwork }"
          >
            <img src="@/assets/images/ramp.png" class="h-7 w-7" />
            <span class="text-base">Ramp</span>
          </label>
        </div>
        <div class="flex gap-3 items-center">
          <input
            id="OnRampMoney"
            v-model="selectedProvider"
            type="radio"
            value="onramp.money"
            name="provider"
            :disabled="!props.onRampMoney"
            :class="{ 'opacity-80': !props.onRampMoney }"
          />
          <label
            for="OnRampMoney"
            class="flex gap-2 items-center cursor-pointer"
            :class="{ 'opacity-50': !props.onRampMoney }"
          >
            <img src="@/assets/images/ramp.png" class="h-7 w-7" />
            <span class="text-base">onramp.money</span>
          </label>
        </div>
        <div class="flex">
          <button
            class="flex-1 text-sm sm:text-xs rounded-xl text-white dark:bg-white bg-black dark:text-black h-9 sm:h-8 uppercase disabled:opacity-50 transition-opacity duration-300"
            :disabled="!selectedProvider?.trim().length"
          >
            Proceed
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
input[type='radio'] {
  display: grid;
  place-content: center;
  width: 1rem;
  height: 1rem;
  cursor: pointer;
  background: #3b3b3b;
  border-radius: 50%;
  transform: translateX(0), matrix(-1, 0, 0, 1, 0, 0);
  appearance: none;
}

input[type='radio']::before {
  width: 0.75rem;
  height: 0.75rem;
  content: '';
  background: linear-gradient(180deg, #0085ff -4.5%, #29c8fa 100.1%);
  border-radius: 50%;
  transition: 120ms transform ease-in-out;
  transform: scale(0);
}

input[type='radio']:checked::before {
  transform: scale(1);
}

.modal-title {
  font-size: var(--fs-500);
}

.modal-description {
  font-size: var(--fs-250);
  color: var(--fg-color-secondary);
}
</style>
