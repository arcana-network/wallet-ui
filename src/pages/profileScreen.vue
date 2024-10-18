<script setup lang="ts">
import Decimal from 'decimal.js'
import type { Connection } from 'penpal'
import { computed, onBeforeMount, ref, reactive, toRefs, watch } from 'vue'
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
import { ChainType } from '@/utils/chainType'
import { AUTH_URL } from '@/utils/constants'
import { content, errors } from '@/utils/content'
import { getAuthProvider } from '@/utils/getAuthProvider'
import { getImage } from '@/utils/getImage'
import { NEARAccountHandler } from '@/utils/near/accountHandler'
import { getWindowFeatures } from '@/utils/popupProps'
import { getRequestHandler } from '@/utils/requestHandlerSingleton'
import { getSensitiveStorage, getStorage } from '@/utils/storageWrapper'
import { useSVGInjector } from '@/utils/useSvgInjector.ts'
import { getFontFaimly, getFontSizeStyle } from '@/utils/utilsFunction'

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
const balanceBreakdown = reactive({
  total: '',
  available: '',
  staked: '',
  locked: '',
})

onBeforeMount(async () => {
  if (appStore.chainType === ChainType.near_cv25519) {
    loader.value = {
      show: true,
      message: 'Fetching balance...',
    }
    const accountHandler =
      getRequestHandler().getAccountHandler() as NEARAccountHandler
    const breakdown = await accountHandler.getBalanceBreakdown()
    balanceBreakdown.total = new Decimal(breakdown.total.toString())
      .div(Decimal.pow(10, accountHandler.decimals))
      .toDecimalPlaces(12)
      .toString()
    balanceBreakdown.available = new Decimal(breakdown.available.toString())
      .div(Decimal.pow(10, accountHandler.decimals))
      .toDecimalPlaces(12)
      .toString()
    balanceBreakdown.staked = new Decimal(breakdown.staked.toString())
      .div(Decimal.pow(10, accountHandler.decimals))
      .toDecimalPlaces(12)
      .toString()
    balanceBreakdown.locked = new Decimal(breakdown.locked.toString())
      .div(Decimal.pow(10, accountHandler.decimals))
      .toDecimalPlaces(12)
      .toString()
    hideLoader()
  }
})

const {
  info: { email, name },
} = user
const { walletAddressShrinked, walletAddress } = toRefs(user)
const { id: appId } = appStore
const parentConnection: Connection<ParentConnectionApi> | null =
  parentConnectionStore.parentConnection

const privateKey = computed(() => {
  if (appStore.chainType === ChainType.near_cv25519) {
    return `ed25519:${user.privateKey}`
  }
  return user.privateKey
})

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

const sendLogoutMessage = () => {
  getSensitiveStorage().removeUserInfo()
  const bc = new BroadcastChannel(`${appStore.id}_login_helper`)
  bc.postMessage({
    method: 'LOGOUT',
  })
  bc.close()
}

async function handleLogout() {
  appStore.showWallet = false
  const parentConnectionInstance = await parentConnection?.promise
  const authProvider = await getAuthProvider(appId)
  sendLogoutMessage()
  getRequestHandler().onDisconnect()
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

const copyContainer = ref<HTMLElement | null>(null)
const externalContainer = ref<HTMLElement | null>(null)
const externalContainer2 = ref<HTMLElement | null>(null)

const svgRefs = [copyContainer, externalContainer, externalContainer2]

const { fetchAndInjectSVG } = useSVGInjector(svgRefs)
</script>

<template>
  <div v-if="loader.show" class="flex justify-center items-center flex-1">
    <AppLoader :message="loader.message" />
  </div>
  <div v-else class="flex-grow flex flex-col gap-5 mb-5">
    <div class="flex justify-center align-center">
      <span class="font-Nohemi text-[20px] font-medium">Profile</span>
    </div>
    <div class="card p-4 flex flex-col gap-5">
      <div v-if="name" class="flex flex-col">
        <span
          :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
          :style="{
            fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
              .primaryFontClass,
            color: appStore.theme_settings.font_color,
          }"
          >Name</span
        >
        <span
          :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
          :style="{
            fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
              .primaryFontClass,
            color: appStore.theme_settings.font_color,
          }"
        >
          {{ name }}
        </span>
      </div>
      <div class="flex flex-col">
        <span
          :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
          :style="{
            fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
              .primaryFontClass,
            color: appStore.theme_settings.font_color,
          }"
          >Email ID</span
        >
        <span
          :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
          :style="{
            fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
              .primaryFontClass,
            color: appStore.theme_settings.font_color,
          }"
        >
          {{ email || 'Not available' }}
        </span>
      </div>
      <div class="flex flex-col">
        <span
          :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
          :style="{
            fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
              .primaryFontClass,
            color: appStore.theme_settings.font_color,
          }"
          >Wallet Address</span
        >
        <div class="flex gap-2">
          <span
            :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
            :style="{
              fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                .primaryFontClass,
              color: appStore.theme_settings.font_color,
            }"
          >
            {{ walletAddressShrinked }}
          </span>
          <button
            title="Click to copy"
            @click.stop="
              copyToClipboard(walletAddress, 'Wallet address copied')
            "
          >
            <div ref="copyContainer">
              <img
                :src="getImage('copy-big.svg')"
                class="w-4 h-4"
                alt="Copy Icon"
                @load="(event) => fetchAndInjectSVG(event, 0)"
              />
            </div>
          </button>
        </div>
      </div>
      <div
        v-if="appStore.chainType !== ChainType.multiversx_cv25519"
        class="flex flex-col"
        :class="{
          'z-[999] startertips_highlighted': starterTipsStore.showExportkey,
        }"
      >
        <span
          :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
          :style="{
            fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
              .primaryFontClass,
            color: appStore.theme_settings.font_color,
          }"
          >Private Key</span
        >
        <button
          class="flex gap-2 items-center disabled:opacity-100"
          title="Click to export private key"
          :disabled="starterTipsStore.showExportkey"
          @click.stop="handleShowPrivateKeyCautionModal"
        >
          <span
            :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
            :style="{
              fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                .primaryFontClass,
              color: appStore.theme_settings.font_color,
            }"
          >
            Export Key
          </span>
          <div ref="externalContainer">
            <img
              :src="getImage('external-link.svg')"
              class="w-4 h-4"
              alt="External Icon"
              @load="(event) => fetchAndInjectSVG(event, 1)"
            />
          </div>
        </button>
      </div>
      <div
        v-if="appStore.chainType === ChainType.near_cv25519"
        class="flex flex-col gap-2"
      >
        <div class="flex flex-col">
          <span
            :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
            :style="{
              fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                .primaryFontClass,
              color: appStore.theme_settings.font_color,
            }"
            >Total Balance</span
          >
          <span
            :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
            :style="{
              fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                .primaryFontClass,
              color: appStore.theme_settings.font_color,
            }"
          >
            {{ balanceBreakdown.total }} NEAR
          </span>
        </div>
        <div class="flex flex-col">
          <span
            :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
            :style="{
              fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                .primaryFontClass,
              color: appStore.theme_settings.font_color,
            }"
            >Available Balance</span
          >
          <span
            :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
            :style="{
              fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                .primaryFontClass,
              color: appStore.theme_settings.font_color,
            }"
          >
            {{ balanceBreakdown.available }} NEAR
          </span>
        </div>
        <div class="flex flex-col">
          <span
            class="text-sm font-medium text-gray-bermuda-grey dark:text-gray-spanish"
            >Balance Reserved for Storage</span
          >
          <span
            :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
            :style="{
              fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                .primaryFontClass,
              color: appStore.theme_settings.font_color,
            }"
          >
            {{ balanceBreakdown.locked }} NEAR
          </span>
        </div>
        <div class="flex flex-col">
          <span
            :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
            :style="{
              fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                .primaryFontClass,
              color: appStore.theme_settings.font_color,
            }"
            >Balance Staked</span
          >
          <span
            :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
            :style="{
              fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                .primaryFontClass,
              color: appStore.theme_settings.font_color,
            }"
          >
            {{ balanceBreakdown.staked }} NEAR
          </span>
        </div>
      </div>
      <div v-if="appStore.isMfaEnabled" class="flex flex-col">
        <span
          :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
          :style="{
            fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
              .primaryFontClass,
            color: appStore.theme_settings.font_color,
          }"
          >Enhance Wallet Security</span
        >
        <div>
          <button
            v-if="!user.hasMfa"
            class="text-lg font-normal flex gap-2 items-center"
            title="Click to setup MFA"
            @click.stop="handleShowMFAProceedModal(true)"
          >
            <span
              v-if="true"
              :class="
                getFontSizeStyle(Number(appStore.theme_settings.font_size))
              "
              :style="{
                fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                  .primaryFontClass,
                color: appStore.theme_settings.font_color,
              }"
              >Setup Now</span
            >
            <span
              v-else
              :class="
                getFontSizeStyle(Number(appStore.theme_settings.font_size))
              "
              :style="{
                fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                  .primaryFontClass,
                color: appStore.theme_settings.font_color,
              }"
              >Update Security Questions</span
            >
            <div ref="externalContainer2">
              <img
                :src="getImage('external-link.svg')"
                class="w-4 h-4"
                alt="External Icon"
                @load="(event) => fetchAndInjectSVG(event, 2)"
              />
            </div>
          </button>
          <span
            v-else
            :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
            :style="{
              fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                .primaryFontClass,
              color: appStore.theme_settings.font_color,
            }"
            >In use</span
          >
        </div>
      </div>
    </div>
    <div class="flex">
      <button
        class="flex justify-center btn-secondary items-center w-full p-2"
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
          borderColor: appStore.theme_settings.accent_color,
          backgroundColor: appStore.theme_settings.accent_color,
        }"
        @click="handleLogout"
      >
        Logout
      </button>
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
