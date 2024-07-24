<script setup lang="ts">
import { ref, type Ref } from 'vue'
import { useRouter } from 'vue-router'

import AppLoader from '@/components/AppLoader.vue'
import { getImage } from '@/utils/getImage'

const emit = defineEmits(['close'])
const router = useRouter()
const isLoading = ref(false)
const showStatusModal: Ref<'success' | 'failed' | 'cancelled' | ''> = ref('')
const statusText = ref({
  title: '',
  message: '',
})

function handleCancel() {
  router.push({ name: 'home' })
  return emit('close')
}

function handleDisplay() {
  router.push({ name: 'SeedPhraseMVX' })
  return emit('close')
}
</script>

<template>
  <div>
    <AppLoader v-if="isLoading" message="Processing..." />
    <div v-else class="flex flex-col p-1">
      <div class="flex flex-col gap-3">
        <p class="font-Nohemi font-medium text-center text-xl">
          Display Seed Phrase?
        </p>
        <p class="text-xs text-center text-zinc-400">
          Would you like to view the seed phrase and record it now? You will not
          be able to view this later. The seed phrase is necessary to import
          this account into other MultiversX wallets.
        </p>
      </div>
      <form class="flex flex-col mt-5 space-y-4">
        <button
          class="flex-1 btn-primary py-[10px]"
          @click.stop="handleDisplay()"
        >
          Display Seed Phrase
        </button>
        <button class="flex-1 btn-tertiary" @click.stop="handleCancel()">
          Skip and Proceed
        </button>
      </form>
      <img
        :src="getImage('secured-by-arcana.svg')"
        class="h-3 select-none mt-5"
      />
    </div>
  </div>
</template>
