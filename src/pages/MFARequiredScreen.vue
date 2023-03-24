<script setup lang="ts">
import { useRouter } from 'vue-router'

import { useAppStore } from '@/store/app'
import { AUTH_URL } from '@/utils/constants'
import { getWindowFeatures } from '@/utils/popupProps'
import { getStorage } from '@/utils/storageWrapper'

const appStore = useAppStore()
const router = useRouter()

function handleProceed() {
  const mfaSetupPath = new URL(`mfa/${appStore.id}/setup`, AUTH_URL)
  window.open(mfaSetupPath.toString(), '_blank', getWindowFeatures())
}

function handleAskNever() {
  getStorage().local.setItem('mfa-dnd', '1')
  handleSkip()
}

function handleSkip() {
  router.push({ name: 'home' })
}
</script>

<template>
  <div
    class="wallet__card rounded-[10px] w-full max-w-[40rem] mx-auto h-max min-h-max overflow-y-auto p-4"
  >
    <div class="flex gap-2 items-center mb-2">
      <div class="modal-title font-bold">Setup MFA</div>
    </div>
    <div class="flex">
      <span style="font-size: var(--fs-350)">
        As the dApp “{{ appStore.name }}” interacts with sensitive information,
        it requires you to have Multi-Factor Authentication enabled. Would you
        like to do so now?
      </span>
    </div>
    <div class="flex mt-4 gap-4">
      <button
        class="text-xs sm:text-xs font-medium text-black bg-transparent dark:text-white"
        type="submit"
        @click.stop="handleAskNever"
      >
        Don't ask me again
      </button>
      <button
        class="text-xs sm:text-xs font-medium text-black bg-transparent dark:text-white"
        type="submit"
        @click.stop="handleSkip"
      >
        Skip for now
      </button>
      <button
        class="text-sm sm:text-xs font-semibold text-black bg-transparent dark:text-white uppercase"
        type="submit"
        @click.stop="handleProceed"
      >
        Proceed
      </button>
    </div>
  </div>
</template>

<style scoped>
label {
  padding-left: 5px;
  font-size: var(--fs-300);
  font-weight: 600;
  color: var(--fg-color-secondary);
}

hr {
  border-top: 1px solid #8d8d8d20;
}

.title {
  font-size: var(--fs-500);
}

.description {
  font-size: var(--fs-250);
  color: var(--fg-color-secondary);
}
</style>
