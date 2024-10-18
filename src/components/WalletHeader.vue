<script setup lang="ts">
import { ref, onBeforeMount, onMounted, type Ref, watch } from 'vue'

import ChainListModal from '@/components/ChainListModal.vue'
import ReceiveTokens from '@/components/ReceiveTokens.vue'
import { getChainLogoUrl } from '@/services/chainlist.service'
import { useAppStore } from '@/store/app'
import { useModalStore } from '@/store/modal'
import { useRpcStore } from '@/store/rpc'
import { useStarterTipsStore } from '@/store/starterTips'
import { ChainType } from '@/utils/chainType'
import { devLogger } from '@/utils/devLogger'
import { getImage } from '@/utils/getImage'
import { useSVGInjector } from '@/utils/useSvgInjector.ts'
import { getFontFaimly, getFontSizeStyle } from '@/utils/utilsFunction'

type ModalState = 'receive' | 'chain-list' | false

const appStore = useAppStore()
const showModal: Ref<ModalState> = ref(false)
const modalStore = useModalStore()
const isChainListExpanded = ref(false)
const rpcStore = useRpcStore()
const hasChainUpdated = ref(true)
const starterTipsStore = useStarterTipsStore()

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

const getLogo = () => {
  return (
    appStore.appLogo?.horizontal ||
    getImage('fallback-logo-dark-mode.png', 'light')
  )
}

// Create refs for SVG containers
const arrowContainer = ref<HTMLElement | null>(null)
const svgContainer = ref<HTMLElement | null>(null)

const svgRefs = [arrowContainer, svgContainer]

const { fetchAndInjectSVG } = useSVGInjector(svgRefs)
</script>

<template>
  <div>
    <header class="flex justify-between px-4 py-2">
      <div class="flex gap-2">
        <img
          :src="getLogo()"
          alt="App Logo"
          class="w-xl h-xl object-contain"
          onerror="this.style.display='none'"
        />
        <div class="flex flex-col items-start">
          <span
            class="text-lg max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap"
            :title="appStore.name"
            :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
            :style="{
              fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                .primaryFontClass,
              color: appStore.theme_settings.font_color,
            }"
            >{{ appStore.name }}</span
          >
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button
          class="flex items-center startertips_highlighted"
          :class="{ 'z-[999]': starterTipsStore.showSwitchNetwork }"
          @click.stop="openChainList()"
        >
          <div v-if="hasChainUpdated" class="w-xl h-xl rounded-full">
            <img
              :src="
                getChainLogoUrl(
                  rpcStore.selectedRPCConfig,
                  getChainType(appStore.chainType)
                )
              "
              :alt="rpcStore.selectedRpcConfig?.chainName"
              :title="rpcStore.selectedRpcConfig?.chainName"
              class="w-xl h-xl rounded-full"
              @error="handleFallbackLogo"
            />
          </div>
          <div ref="arrowContainer">
            <img
              :src="getImage('arrow-down.svg')"
              class="transition-all duration-200 ease-in-out"
              :class="{ '-rotate-180': isChainListExpanded }"
              title="Click to expand"
              alt="Arrow Icon"
              @load="(event) => fetchAndInjectSVG(event, 0)"
            />
          </div>
        </button>
        <button
          class="w-xl h-xl"
          title="Click to show the QR Code"
          @click.stop="openReceiveTokens(true)"
        >
          <div ref="svgContainer">
            <img
              :src="getImage('qr-code.svg')"
              alt="Wallet Icon"
              @load="(event) => fetchAndInjectSVG(event, 1)"
            />
          </div>
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

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&family=Onest:wght@100..900&family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Syne:wght@400..800&display=swap');

.pt-sans {
  font-family: 'PT Sans', sans-serif;
  font-style: normal;
}

.nunito {
  font-family: 'Nunito Sans', sans-serif;
  font-style: normal;
}

.onest {
  font-family: Onest, sans-serif;
  font-style: normal;
}

.syne {
  font-family: Syne, sans-serif;
  font-style: normal;
}

.inter {
  font-family: Inter, sans-serif;
  font-style: normal;
}

.nohemi {
  font-family: Nohemi, sans-serif;
  font-style: normal;
}

::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
</style>
