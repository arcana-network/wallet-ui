<script setup lang="ts">
import { ref, type Ref } from 'vue'
import { useRouter } from 'vue-router'

import AppLoader from '@/components/AppLoader.vue'
import { getImage } from '@/utils/getImage'

const emit = defineEmits(['close'])
const router = useRouter()
const isLoading = ref(false)

function handleProceed() {
  router.push({ name: 'home' })
  return emit('close')
}
</script>

<template>
  <div>
    <AppLoader v-if="isLoading" message="Processing..." />
    <div v-else class="card-secondary flex flex-col py-6 px-3">
      <div class="flex flex-col gap-3">
        <img
          src="@/assets/images/success.svg"
          alt="success"
          class="h-20 w-20 mx-auto"
        />
        <p class="font-Nohemi font-medium text-center text-xl">Done</p>
        <p class="text-sm text-center text-zinc-400">
          Great! You can now use this seed phrase to import your account into
          another wallet app anytime you like.
        </p>
      </div>
      <form class="flex flex-col mt-5 space-y-4">
        <button
          class="flex-1 btn-primary py-[10px]"
          @click.stop="handleProceed()"
        >
          Proceed
        </button>
      </form>
    </div>
    <div class="flex space-x-1 justify-center items-center pt-6">
      <span class="text-sm">Powered by</span>
      <img :src="getImage('arcana-logo.svg')" alt="arcana" class="h-3" />
    </div>
  </div>
</template>
