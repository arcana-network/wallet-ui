<script setup lang="ts">
import { ref } from 'vue'

import AppLoader from '@/components/AppLoader.vue'
import { useUserStore } from '@/store/user'
import { getImage } from '@/utils/getImage'
import { getStorage } from '@/utils/storageWrapper'

const emit = defineEmits(['proceed', 'close'])
const isLoading = ref(false)
const storage = getStorage()
const userStore = useUserStore()

function handleDismiss() {
  storage.local.sethasMVXSeedShown(userStore.info.id, true)
  emit('close')
}
function handleProceed() {
  storage.local.sethasMVXSeedShown(userStore.info.id, true)
  emit('proceed')
}
</script>

<template>
  <div>
    <AppLoader v-if="isLoading" message="Processing..." />
    <div v-else class="flex flex-col p-1">
      <div class="flex flex-col gap-3">
        <h1 class="font-Nohemi font-medium text-center text-xl tracking-wide">
          Display Seed Phrase?
        </h1>
        <p class="text-sm text-center text-zinc-400">
          Would you like to view the seed phrase and record it now? You will
          <span class="font-bold">not be able to view</span>
          this later. The seed phrase is necessary to import this account into
          other MultiversX wallets.
        </p>
      </div>
      <form class="flex flex-col mt-5 space-y-2">
        <button
          class="flex-1 btn-primary accent-color py-[10px]"
          @click.stop="handleProceed"
        >
          Display Seed Phrase
        </button>
        <button class="flex-1 btn-tertiary" @click.stop="handleDismiss">
          Skip and Proceed
        </button>
      </form>
      <div class="flex space-x-1 justify-center items-center pt-6">
        <span class="text-sm">Powered by</span>
        <img :src="getImage('arcana-logo.svg')" alt="arcana" class="h-3" />
      </div>
    </div>
  </div>
</template>
