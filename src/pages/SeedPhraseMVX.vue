<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

import AppLoader from '@/components/AppLoader.vue'
import SendTokensPreview from '@/components/SendTokensPreview.vue'
import { useAppStore } from '@/store/app'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import { getImage } from '@/utils/getImage'
import { getMnemonicInShard } from '@/utils/multiversx/shard'

const showPreview = ref(false)
const router = useRouter()
const toast = useToast()
const appStore = useAppStore()

const loader = ref({
  show: false,
  message: '',
})

function showLoader(message) {
  loader.value.show = true
  loader.value.message = `${message}...`
}

function hideLoader() {
  loader.value.show = false
  loader.value.message = ''
}
</script>

<template>
  <div class="flex flex-col justify-between">
    <div class="relative flex justify-center items-center">
      <button
        class="absolute left-0 accent-color"
        title="Click to go back"
        @click.stop="router.push({ name: 'home' })"
      >
        <img
          :src="getImage('back-arrow.svg')"
          class="w-6 h-6"
          onload="SVGInject(this)"
        />
      </button>
      <h1 class="font-Nohemi text-2xl font-medium">Seed Phrase</h1>
    </div>

    <form class="flex flex-col flex-grow justify-between mt-5">
      <div class="flex flex-col gap-6">
        <span class="text-sm font-lighter text-center">
          Please record the seed phrase shown below exactly in the order that it
          is shown. Take care to record this in a safe place offline for maximum
          safety.
        </span>
      </div>

      <!-- 3x8 Grid of Input Boxes -->
      <div class="grid grid-cols-3 gap-3 my-4">
        <div v-for="i in 24" :key="i" class="flex justify-center">
          <input
            type="text"
            :value="i + '.' + ' ' + 'Word'"
            class="input-field border w-full h-10"
            readonly
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-1 mt-4">
        <button
          class="btn-tertiary accent-color flex items-center justify-center gap-2 py-2"
        >
          <img
            :src="getImage('copy.svg')"
            alt="Copy wallet address"
            onload="SVGInject(this)"
          />
          Copy
        </button>

        <button
          class="btn-tertiary accent-color flex items-center justify-center gap-2 py-2"
        >
          <!-- <img :src="getImage('print.svg')" alt="Print wallet address" /> -->
          Print
        </button>
      </div>

      <div class="flex mt-2">
        <button class="btn-primary accent-color py-[10px] text-center w-full">
          Verify
        </button>
      </div>
    </form>
  </div>
</template>
