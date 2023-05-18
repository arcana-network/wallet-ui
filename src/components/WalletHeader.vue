<script setup lang="ts">
import { ref, type Ref, watch } from 'vue'

import ReceiveTokens from '@/components/ReceiveTokens.vue'
import { useAppStore } from '@/store/app'
import { useModalStore } from '@/store/modal'
import { getImage } from '@/utils/getImage'

type ModalState = 'receive' | false

const appStore = useAppStore()
const showModal: Ref<ModalState> = ref(false)
const modalStore = useModalStore()

function openReceiveTokens(open) {
  modalStore.setShowModal(open)
  showModal.value = open ? 'receive' : false
}

watch(
  () => modalStore.show,
  (show) => {
    if (!show) showModal.value = false
  }
)
</script>

<template>
  <div>
    <header class="flex justify-between px-4 py-2">
      <div class="flex items-center gap-2">
        <img
          :src="appStore.appLogo?.horizontal"
          alt="App Logo"
          class="w-xl h-xl"
        />
        <span class="font-bold text-lg">{{ appStore.name }}</span>
      </div>
      <div class="flex items-center gap-3">
        <button class="w-xl h-xl rounded-full">
          <img :src="`/chain-logos/ethereum-icon.png`" alt="Network Icon" />
        </button>
        <button class="w-xl h-xl" @click.stop="openReceiveTokens(true)">
          <img :src="getImage('qr-code.svg')" alt="Wallet Icon" />
        </button>
      </div>
    </header>
    <Teleport v-if="modalStore.show" to="#modal-container">
      <ReceiveTokens v-if="showModal === 'receive'" />
    </Teleport>
  </div>
</template>
