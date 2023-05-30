<script setup lang="ts">
import { ref, type Ref, watch } from 'vue'

import ChainListModal from '@/components/ChainListModal.vue'
import ReceiveTokens from '@/components/ReceiveTokens.vue'
import { useAppStore } from '@/store/app'
import { useModalStore } from '@/store/modal'
import { getImage } from '@/utils/getImage'

type ModalState = 'receive' | 'chain-list' | false

const appStore = useAppStore()
const showModal: Ref<ModalState> = ref(false)
const modalStore = useModalStore()
const isChainListExpanded = ref(false)

function openReceiveTokens(open) {
  modalStore.setShowModal(open)
  showModal.value = open ? 'receive' : false
}

function openChainList() {
  modalStore.setShowModal(true)
  isChainListExpanded.value = true
  showModal.value = 'chain-list'
}

watch(
  () => modalStore.show,
  (show) => {
    if (!show) {
      showModal.value = false
      isChainListExpanded.value = false
    }
  }
)
</script>

<template>
  <div>
    <header class="flex justify-between px-4 py-2">
      <div class="flex flex-col">
        <div class="flex items-center gap-2">
          <img
            :src="appStore.appLogo?.horizontal"
            alt="App Logo"
            class="w-xl h-xl"
          />
          <span class="font-bold text-lg max-w-20 overflow-hidde">{{
            appStore.name
          }}</span>
        </div>
        <div class="flex justify-start">
          <img :src="getImage('secured-by-arcana.svg')" class="h-3 ml-8" />
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button class="flex items-center" @click.stop="openChainList()">
          <div class="w-xl h-xl rounded-full">
            <img :src="`/chain-logos/ethereum-icon.png`" alt="Network Icon" />
          </div>
          <img
            :src="getImage('arrow-down.svg')"
            class="transition-all duration-200 ease-in-out"
            :class="{ '-rotate-180': isChainListExpanded }"
          />
        </button>
        <button class="w-xl h-xl" @click.stop="openReceiveTokens(true)">
          <img :src="getImage('qr-code.svg')" alt="Wallet Icon" />
        </button>
      </div>
    </header>
    <Teleport v-if="modalStore.show" to="#modal-container">
      <ReceiveTokens v-if="showModal === 'receive'" />
      <ChainListModal v-if="showModal === 'chain-list'" />
    </Teleport>
  </div>
</template>
