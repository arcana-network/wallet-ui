<script setup lang="ts">
import type { Connection } from 'penpal'
import { storeToRefs } from 'pinia'
import { ref, toRefs } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

import AppLoader from '@/components/AppLoader.vue'
import ExportKeyModal from '@/components/ExportKeyModal.vue'
import MFAProceedModal from '@/components/MFAProceedModal.vue'
import PrivateKeyCautionModal from '@/components/PrivateKeyCautionModal.vue'
import type { ParentConnectionApi } from '@/models/Connection'
import { useAppStore } from '@/store/app'
import { useModalStore } from '@/store/modal'
import { useParentConnectionStore } from '@/store/parentConnection'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import { AUTH_URL } from '@/utils/constants'
import { downloadFile } from '@/utils/downloadFile'
import { getAuthProvider } from '@/utils/getAuthProvider'
import { getWindowFeatures } from '@/utils/popupProps'

const user = useUserStore()
const appStore = useAppStore()
const toast = useToast()
const rpcStore = useRpcStore()
const modalStore = useModalStore()
const parentConnectionStore = useParentConnectionStore()
const { selectedRpcConfig } = storeToRefs(rpcStore)
const showPrivateKeyCautionModal = ref(false)
const showMFAProceedModal = ref(false)
const showExportKeyModal = ref(false)
const loader = ref({
  show: false,
  message: '',
})

const {
  info: { email, name },
} = user
const { walletAddressShrinked, walletAddress, privateKey } = toRefs(user)
const { id: appId } = appStore
const parentConnection: Connection<ParentConnectionApi> | null =
  parentConnectionStore.parentConnection

async function copyToClipboard(value: string, message: string) {
  try {
    await navigator.clipboard.writeText(value)
    toast.success(message)
  } catch (err) {
    toast.error('Failed to copy')
  }
}

async function handleLogout() {
  const parentConnectionInstance = await parentConnection?.promise
  const authProvider = await getAuthProvider(appId)
  await user.handleLogout(authProvider)
  parentConnectionInstance?.onEvent('disconnect')
}

function handleProceed() {
  showPrivateKeyCautionModal.value = false
  showExportKeyModal.value = true
}

function handleShowPrivateKeyCautionModal() {
  modalStore.setShowModal(true)
  showPrivateKeyCautionModal.value = true
}

function handleHidePrivateKeyCautionModal() {
  modalStore.setShowModal(false)
  showPrivateKeyCautionModal.value = false
}

function handleHideExportKeyModal() {
  modalStore.setShowModal(false)
  showExportKeyModal.value = false
}

function handlePrivateKeyDownload() {
  const fileData = new Blob([privateKey.value], {
    type: 'text/plain',
  })
  downloadFile(`${walletAddress.value}-private-key.txt`, fileData)
}

function handleShowMFAProceedModal(show: boolean) {
  modalStore.setShowModal(show)
  showMFAProceedModal.value = show
}

function handleMFASetupClick() {
  const mfaSetupPath = new URL(`mfa/${appStore.id}/setup`, AUTH_URL)
  window.open(mfaSetupPath.toString(), '_blank', getWindowFeatures())
}

onBeforeRouteLeave((to) => {
  if (to.path.includes('login')) parentConnection?.destroy()
})
</script>

<template>
  <div v-if="loader.show" class="flex justify-center items-center flex-1">
    <AppLoader :message="loader.message" />
  </div>
  <div v-else class="flex-grow">
    <div class="wallet__card rounded-[10px] flex flex-1 flex-col min-h-full">
      <div
        class="flex flex-col items-center min-h-full p-4 sm:p-2 space-y-5 sm:space-y-2 flex-grow"
      >
        <h1 class="home__title w-full text-left font-semibold">Welcome</h1>
        <div
          class="home__body-container flex flex-col w-full h-full text-left space-y-4 sm:space-y-2 debossed-card flex-grow"
        >
          <div v-if="name" class="flex flex-col gap-1">
            <p class="home__body-content-label">Name</p>
            <p class="home__body-content-value text-ellipsis overflow-hidden">
              {{ name }}
            </p>
          </div>
          <div class="flex flex-col gap-1">
            <p class="home__body-content-label">Email ID</p>
            <p class="home__body-content-value text-ellipsis overflow-hidden">
              {{ email }}
            </p>
          </div>
          <div class="flex flex-col gap-1">
            <p class="home__body-content-label">Network</p>
            <p class="home__body-content-value">
              {{ selectedRpcConfig?.chainName }}
            </p>
          </div>
          <div class="flex flex-col gap-1">
            <p class="home__body-content-label">Wallet Address</p>
            <p class="home__body-content-value">
              <span>{{ walletAddressShrinked }}</span>
              <img
                src="@/assets/images/copy.svg"
                alt="Click to copy"
                class="w-6 aspect-square ml-3 cursor-pointer invert dark:invert-0"
                @click.stop="
                  copyToClipboard(walletAddress, 'Wallet address copied')
                "
              />
            </p>
          </div>
          <div class="flex flex-col gap-1">
            <p class="home__body-content-label">Private Key</p>
            <button
              class="home__body-content-value h-max w-max"
              @click.stop="handleShowPrivateKeyCautionModal"
            >
              <span>Export Key</span>
              <img
                src="@/assets/images/export.svg"
                alt="Click to export"
                class="w-6 aspect-square ml-3 invert dark:invert-0"
              />
            </button>
          </div>
          <div class="flex flex-col gap-1">
            <p class="home__body-content-label">Multifactor Authentication</p>
            <button
              v-if="!user.hasMfa"
              class="home__body-content-value h-max w-max"
              @click.stop="handleShowMFAProceedModal(true)"
            >
              <span v-if="true">Setup Now</span>
              <span v-else>Update Security Questions</span>
              <img
                src="@/assets/images/export.svg"
                alt="Click to export"
                class="w-6 aspect-square ml-3 invert dark:invert-0"
              />
            </button>
            <span v-else class="home__body-content-value h-max w-max"
              >In use</span
            >
          </div>
        </div>
        <div class="flex w-full text-sm sm:text-xs justify-center">
          <button
            class="home__footer-button-outline rounded-xl border-2 border-solid w-1/2 uppercase"
            @click="handleLogout"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
    <Teleport v-if="modalStore.show" to="#modal-container">
      <PrivateKeyCautionModal
        v-if="showPrivateKeyCautionModal"
        @proceed="handleProceed"
        @close="handleHidePrivateKeyCautionModal"
      />
      <ExportKeyModal
        v-if="showExportKeyModal"
        :private-key="privateKey"
        @copy="copyToClipboard(privateKey, 'Private key copied')"
        @download="handlePrivateKeyDownload"
        @close="handleHideExportKeyModal"
      />
      <MFAProceedModal
        v-if="showMFAProceedModal"
        @proceed="handleMFASetupClick"
        @close="handleShowMFAProceedModal(false)"
      />
    </Teleport>
  </div>
</template>

<style scoped>
.home__title {
  font-size: var(--fs-500);
}

.home__body-container {
  padding: var(--p-400);
  color: var(--fg-color);
  border-radius: 10px;
}

.home__body-content-label {
  font-size: var(--fs-300);
  font-weight: 600;
  color: var(--fg-color-secondary);
}

.home__body-content-value {
  display: flex;
  align-items: center;
  font-size: var(--fs-400);
  font-weight: 400;
}

.home__footer-button-outline {
  color: var(--outlined-button-fg-color);
  border-color: var(--outlined-button-border-color);
}

.home__footer-button-filled {
  flex: 1;
  color: var(--filled-button-fg-color);
  background-color: var(--filled-button-bg-color);
  border-radius: 10px;
}
</style>
