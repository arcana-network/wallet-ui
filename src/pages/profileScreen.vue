<script setup lang="ts">
import type { Connection } from 'penpal'
import { ref, toRefs, watch } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

import AppLoader from '@/components/AppLoader.vue'
import ExportKeyModal from '@/components/ExportKeyModal.vue'
import MFAProceedModal from '@/components/MFAProceedModal.vue'
import PrivateKeyCautionModal from '@/components/PrivateKeyCautionModal.vue'
import type { ParentConnectionApi } from '@/models/Connection'
import { makeRequest } from '@/services/request.service'
import { useAppStore } from '@/store/app'
import { useModalStore } from '@/store/modal'
import { useParentConnectionStore } from '@/store/parentConnection'
import { useRpcStore } from '@/store/rpc'
import { useStarterTipsStore } from '@/store/starterTips'
import { useUserStore } from '@/store/user'
import { AUTH_URL } from '@/utils/constants'
import { content, errors } from '@/utils/content'
import { getAuthProvider } from '@/utils/getAuthProvider'
import { getImage } from '@/utils/getImage'
import { getWindowFeatures } from '@/utils/popupProps'
import { getStorage } from '@/utils/storageWrapper'

const user = useUserStore()
const router = useRouter()
const appStore = useAppStore()
const toast = useToast()
const rpcStore = useRpcStore()
const modalStore = useModalStore()
const parentConnectionStore = useParentConnectionStore()
const showPrivateKeyCautionModal = ref(false)
const showMFAProceedModal = ref(false)
const showExportKeyModal = ref(false)
const loader = ref({
  show: false,
  message: '',
})
const starterTipsStore = useStarterTipsStore()

const {
  info: { email, name },
} = user
const { walletAddressShrinked, walletAddress } = toRefs(user)
const { id: appId } = appStore
const parentConnection: Connection<ParentConnectionApi> | null =
  parentConnectionStore.parentConnection

let mfaWindow: Window | null
let cleanExit = false

async function copyToClipboard(value: string, message: string) {
  try {
    await navigator.clipboard.writeText(value)
    toast.success(message)
  } catch (err) {
    toast.error(errors.COPY)
  }
}

async function handleLogout() {
  appStore.showWallet = false
  const parentConnectionInstance = await parentConnection?.promise
  const authProvider = await getAuthProvider(appId)
  await user.handleLogout(authProvider)
  parentConnectionInstance?.onEvent('disconnect')
}

function getRequestObject() {
  const request = {
    method: '_arcana_privateKey',
    params: {
      privateKey: user.privateKey,
      walletAddress: user.walletAddress,
    },
  }
  return {
    type: 'json_rpc_request',
    data: {
      request,
      chainId: rpcStore.selectedChainId,
    },
  }
}

async function handleProceed() {
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

function handleShowMFAProceedModal(show: boolean) {
  modalStore.setShowModal(show)
  showMFAProceedModal.value = show
}

async function handleMFASetupClick() {
  const info = getStorage().session.getUserInfo()
  if (!info) {
    return
  }

  if (getStorage().session.getInAppLogin()) {
    modalStore.setShowModal(false)
    router.push({
      name: 'MFASetup',
      params: { appId: appStore.id },
      query: {
        inApp: '1',
      },
    })
  } else {
    cleanExit = false
    const mfaSetupPath = new URL(`mfa/${appStore.id}/setup`, AUTH_URL)
    if (appStore.standaloneMode == 0) {
      mfaWindow = window.open(
        mfaSetupPath.toString(),
        '_blank',
        getWindowFeatures()
      )

      const handler = async (event: MessageEvent) => {
        if (!event?.data?.status) {
          return
        }
        cleanExit = true
        const data = event.data

        if (data.status === 'success') {
          mfaWindow?.close()
          getStorage().local.setHasMFA(user.info.id)
          user.hasMfa = true
          toast.success(content.MFA.SETUP)
          window.removeEventListener('message', handler, false)
          handleShowMFAProceedModal(false)
          hideLoader()
        } else if (data.status == 'error') {
          mfaWindow?.close()
          window.removeEventListener('message', handler, false)
          hideLoader()
          if (data.error !== content.MFA.CANCELLED) toast.error(data.error)
        } else {
          toast.error(errors.MFA.ERROR)
          console.log('Unexpected event')
        }
      }
      window.addEventListener('message', handler, false)

      loader.value = {
        show: true,
        message: 'Setting up MFA...',
      }

      const id = window.setInterval(() => {
        if (!cleanExit && mfaWindow?.closed) {
          console.error('User closed the popup')
          window.removeEventListener('message', handler, false)
          hideLoader()
          clearInterval(id)
        }
      }, 500)
    } else {
      const c = await useParentConnectionStore().parentConnection?.promise
      c?.uiEvent('mfa_setup', {})
    }
  }
}

function hideLoader() {
  loader.value = {
    show: false,
    message: '',
  }
}

onBeforeRouteLeave((to) => {
  if (to.path.includes('login')) parentConnection?.destroy()
})

watch(
  () => modalStore.show,
  () => {
    if (!modalStore.show) {
      showPrivateKeyCautionModal.value = false
      showExportKeyModal.value = false
      showMFAProceedModal.value = false
    }
  }
)
</script>

<template>
  <div v-if="loader.show" class="flex justify-center items-center flex-1">
    <AppLoader :message="loader.message" />
  </div>
  <div v-else class="flex-grow flex flex-col gap-5 mb-5">
    <div class="flex justify-center align-center">
      <span class="text-base font-medium">Profile</span>
    </div>
    <div class="card p-4 flex flex-col gap-5">
      <div v-if="name" class="flex flex-col">
        <span class="text-sm text-gray-100">Name</span>
        <span class="text-base font-medium">
          {{ name }}
        </span>
      </div>
      <div class="flex flex-col">
        <span class="text-sm text-gray-100">Email ID</span>
        <span class="text-base font-medium">
          {{ email || 'Not available' }}
        </span>
      </div>
      <div class="flex flex-col">
        <span class="text-sm text-gray-100">Wallet Address</span>
        <div class="flex gap-2">
          <span class="text-base font-medium">
            {{ walletAddressShrinked }}
          </span>
          <button
            title="Click to copy"
            @click.stop="
              copyToClipboard(walletAddress, 'Wallet address copied')
            "
          >
            <img
              :src="getImage('copy-big.svg')"
              alt="Click to copy"
              class="w-md h-md dark:invert-0 invert"
            />
          </button>
        </div>
      </div>
      <div
        class="flex flex-col"
        :class="{
          'z-[999] startertips_highlighted': starterTipsStore.showExportkey,
        }"
      >
        <span class="text-sm text-gray-100">Private Key</span>
        <button
          class="flex gap-2 items-cente disabled:opacity-100"
          title="Click to export private key"
          :disabled="starterTipsStore.showExportkey"
          @click.stop="handleShowPrivateKeyCautionModal"
        >
          <span class="text-base font-medium"> Export Key </span>
          <img
            :src="getImage('external-link.svg')"
            class="w-md h-md dark:invert-0 invert"
          />
        </button>
      </div>
      <div v-if="appStore.isMfaEnabled" class="flex flex-col">
        <span class="text-sm text-gray-100">Enhance Wallet Security</span>
        <div>
          <button
            v-if="!user.hasMfa"
            class="text-base font-medium flex gap-2 items-center"
            title="Click to setup MFA"
            @click.stop="handleShowMFAProceedModal(true)"
          >
            <span v-if="true">Setup Now</span>
            <span v-else>Update Security Questions</span>
            <img
              :src="getImage('external-link.svg')"
              class="w-md h-md dark:invert-0 invert"
            />
          </button>
          <span v-else class="text-base font-medium">In use</span>
        </div>
      </div>
      <div class="flex">
        <button
          class="flex flex-grow justify-center items-center btn-primary p-2 font-bold text-sm uppercase"
          @click="handleLogout"
        >
          Logout
        </button>
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
        :private-key="user.privateKey"
        :wallet-address="user.walletAddress"
      />
      <MFAProceedModal
        v-if="showMFAProceedModal"
        @proceed="handleMFASetupClick"
        @close="handleShowMFAProceedModal(false)"
      />
    </Teleport>
  </div>
</template>
