<script setup lang="ts">
import { ref, type Ref, watch } from 'vue'

import ChainListModal from '@/components/ChainListModal.vue'
import ReceiveTokens from '@/components/ReceiveTokens.vue'
import { getChainLogoUrl } from '@/services/chainlist.service'
import { useAppStore } from '@/store/app'
import { useModalStore } from '@/store/modal'
import { useRpcStore } from '@/store/rpc'
import { getImage } from '@/utils/getImage'

type ModalState = 'receive' | 'chain-list' | false

const appStore = useAppStore()
const showModal: Ref<ModalState> = ref(false)
const modalStore = useModalStore()
const isChainListExpanded = ref(false)
const rpcStore = useRpcStore()
const hasChainUpdated = ref(true)

function openReceiveTokens(open) {
  modalStore.setShowModal(open)
  showModal.value = open ? 'receive' : false
}

function openChainList() {
  modalStore.setShowModal(true)
  isChainListExpanded.value = true
  showModal.value = 'chain-list'
}

function closeChainListModal() {
  modalStore.setShowModal(false)
  isChainListExpanded.value = false
  showModal.value = false
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

watch(
  () => rpcStore.selectedChainId,
  () => {
    hasChainUpdated.value = false
    setTimeout(() => {
      hasChainUpdated.value = true
    }, 25)
  }
)
</script>

<template>
  <div>
    <header class="flex justify-between px-4 py-2">
      <div class="flex gap-2">
        <img
          :src="appStore.appLogo?.vertical"
          alt="App Logo"
          class="w-xl h-xl"
          onerror="this.style.display='none'"
        />
        <div class="flex flex-col items-start">
          <span
            class="font-bold text-lg max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap"
            :title="appStore.name"
            >{{ appStore.name }}</span
          >
          <img
            :src="getImage('secured-by-arcana.svg')"
            class="h-3 select-none"
          />
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button class="flex items-center" @click.stop="openChainList()">
          <div v-if="hasChainUpdated" class="w-xl h-xl rounded-full">
            <img
              :src="getChainLogoUrl(Number(rpcStore.selectedChainId))"
              :alt="rpcStore.selectedRpcConfig?.chainName"
              :title="rpcStore.selectedRpcConfig?.chainName"
              onerror="this.src = '/chain-logos/blockchain-icon.png'"
              class="w-xl h-xl"
            />
          </div>
          <img
            :src="getImage('arrow-down.svg')"
            class="transition-all duration-200 ease-in-out"
            :class="{ '-rotate-180': isChainListExpanded }"
            title="Click to expand"
          />
        </button>
        <button
          class="w-xl h-xl"
          title="Click to show the QR Code"
          @click.stop="openReceiveTokens(true)"
        >
          <img :src="getImage('qr-code.svg')" alt="Wallet Icon" />
        </button>
      </div>
    </header>
    <Teleport v-if="modalStore.show" to="#modal-container">
      <ReceiveTokens v-if="showModal === 'receive'" />
      <ChainListModal
        v-if="showModal === 'chain-list'"
        @close="closeChainListModal"
      />
    </Teleport>
  </div>
</template>
