<script setup lang="ts">
import { ref, type Ref, watch, defineAsyncComponent } from 'vue'

import ArrowDownIcon from '@/components/SVGIcons/ArrowDown.vue'
import QRCodeIcon from '@/components/SVGIcons/QRCode.vue'
import { getChainLogoUrl } from '@/services/chainlist.service'
import { useAppStore } from '@/store/app'
import { useModalStore } from '@/store/modal'
import { useRpcStore } from '@/store/rpc'
import { ChainType } from '@/utils/chainType'
import { getImage } from '@/utils/getImage'

const ChainListModal = defineAsyncComponent(
  () => import('@/components/ChainListModal.vue')
)
const ReceiveTokens = defineAsyncComponent(
  () => import('@/components/ReceiveTokens.vue')
)

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
    })
  }
)

function handleFallbackLogo(event) {
  event.target.src = getImage('blockchain-icon.png')
}

function getChainType(chainType: ChainType) {
  switch (chainType) {
    case ChainType.evm_secp256k1:
      return 'EVM'
    case ChainType.solana_cv25519:
      return 'solana'
    case ChainType.multiversx_cv25519:
      return 'multiversx'
    case ChainType.near_cv25519:
      return 'near'
  }
}
</script>

<template>
  <div>
    <header class="flex justify-between px-4 py-2">
      <div class="flex gap-2">
        <img
          v-if="appStore.appLogo?.vertical"
          :src="appStore.appLogo?.vertical"
          :alt="appStore.name"
          class="w-xl h-xl object-contain"
        />
        <div class="flex flex-col items-start">
          <span
            class="font-nohemi text-headline-6 max-w-52 overflow-hidden text-ellipsis whitespace-nowrap"
            :title="appStore.name"
            >{{ appStore.name }}</span
          >
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button class="flex items-center" @click.stop="openChainList()">
          <div
            v-if="hasChainUpdated"
            class="w-xl h-xl rounded-full border border-solid"
            :class="{
              'border-system-orange':
                rpcStore.selectedRPCConfig?.chainType === 'testnet',
              'border-transparent':
                rpcStore.selectedRPCConfig?.chainType === 'mainnet',
              'border-system-yellow': rpcStore.selectedRPCConfig?.isCustom,
            }"
          >
            <img
              :src="
                getChainLogoUrl(
                  rpcStore.selectedRPCConfig,
                  getChainType(appStore.chainType)
                )
              "
              :alt="rpcStore.selectedRpcConfig?.chainName"
              :title="rpcStore.selectedRpcConfig?.chainName"
              class="w-full h-full rounded-full object-contain"
              @error="handleFallbackLogo"
            />
          </div>
          <ArrowDownIcon
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
          <QRCodeIcon />
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
