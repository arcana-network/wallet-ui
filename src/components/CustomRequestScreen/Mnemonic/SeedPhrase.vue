<script setup lang="ts">
import { ref, Ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import VerifyPhrase from '@/components/CustomRequestScreen/Mnemonic/VerifyPhrase.vue'
import { useModalStore } from '@/store/modal'
import { getImage } from '@/utils/getImage'

type ModalState = true | false

const showModal: Ref<ModalState> = ref(false)
const router = useRouter()
const modalStore = useModalStore()

const loader = ref({
  show: false,
  message: '',
})

const keyArray: string[] = [
  'Plug',
  'Risk',
  'Opera',
  'Liar',
  'Sudden',
  'Receive',
  'Stuff',
  'Mask',
  'Donate',
  'Mammal',
  'Night',
  'Stable',
  'Direct',
  'Antique',
  'Grocery',
  'Believe',
  'Town',
  'Peasant',
  'Hole',
  'Put',
  'Satoshi',
  'Flavor',
  'Oxygen',
  'Spin',
]

function showLoader(message: string) {
  loader.value.show = true
  loader.value.message = `${message}...`
}

function hideLoader() {
  loader.value.show = false
  loader.value.message = ''
}

function openVerify(open: boolean) {
  try {
    console.log('Open verify modal:', open)
    modalStore.setShowModal(open)
    showModal.value = open
    console.log('Modal store show:', modalStore.show)
    console.log('Local showModal value:', showModal.value)
  } catch (error) {
    console.error('Error in openVerify:', error)
  }
}

onMounted(() => {
  console.log('Modal Store:', modalStore)
})
</script>

<template>
  <div class="flex flex-col justify-between">
    <div class="relative flex justify-center items-center">
      <span class="font-Nohemi text-[20px] font-medium">Seed Phrase</span>
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
        <div
          v-for="(word, index) in keyArray"
          :key="index"
          class="flex justify-center"
        >
          <input
            type="text"
            :value="index + 1 + '.' + ' ' + word"
            class="input-secondary border w-full h-10"
            readonly
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-1 mt-4">
        <button
          class="btn-tertiary flex items-center justify-center gap-2 py-2"
        >
          <img :src="getImage('copy.svg')" alt="Copy wallet address" />
          Copy
        </button>

        <button
          class="btn-tertiary flex items-center justify-center gap-2 py-2"
        >
          <!-- <img :src="getImage('print.svg')" alt="Print wallet address" /> -->
          Print
        </button>
      </div>

      <div class="flex mt-2">
        <button
          class="btn-primary py-[10px] text-center w-full"
          @click.stop="openVerify(true)"
        >
          Verify
        </button>
      </div>
    </form>
    <Teleport v-if="modalStore.show" to="#modal-container">
      <VerifyPhrase v-if="showModal === true" @close="openVerify(false)" />
    </Teleport>
  </div>
</template>
