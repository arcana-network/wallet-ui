<script setup lang="ts">
import { StateInfo, decodeJSON } from '@arcana/auth-core'
import { Core, SecurityQuestionModule } from '@arcana/key-helper'
import dayjs from 'dayjs'
import { getUniqueId } from 'json-rpc-engine'
import { connectToParent } from 'penpal'
import { v4 as genUUID } from 'uuid'
import { ref, onBeforeMount, onUnmounted, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

import AppLoader from '@/components/AppLoader.vue'
import PinBasedRecoveryModal from '@/components/PinBasedRecoveryModal.vue'
import SecurityQuestionRecoveryModal from '@/components/SecurityQuestionRecoveryModal.vue'
import type { RedirectParentConnectionApi } from '@/models/Connection'
import { useAppStore } from '@/store/app'
import { useModalStore } from '@/store/modal'
import { useUserStore } from '@/store/user'
import { GATEWAY_URL, AUTH_NETWORK } from '@/utils/constants'
import { isInAppLogin } from '@/utils/isInAppLogin'
import { handleLogin } from '@/utils/redirectUtils'
import { getStorage, initStorage } from '@/utils/storageWrapper'

const modalStore = useModalStore()
const user = useUserStore()
const toast = useToast()
const app = useAppStore()
const recoveryMethod = ref('')
const securityQuestionModule = new SecurityQuestionModule(3)
let questions: Ref<
  {
    index: string
    kind: 'global' | 'custom'
    question?: string
  }[]
> = ref([])
const loader = ref({
  show: false,
  message: '',
})
document.documentElement.classList.add('dark')

let core: Core
let dkgShare: {
  pk: string
  exp?: dayjs.Dayjs
  id: string
} | null
let userInfoSession
let channel: BroadcastChannel
const route = useRoute()
const router = useRouter()
const appId = route.params.appId as string
initStorage(appId)
const storage = getStorage()

//TODO: Deduplicate this
const EXPIRY_MS = 60 * 60 * 1000

onBeforeMount(async () => {
  loader.value = {
    show: true,
    message: 'Loading metadata...',
  }
  const userInfoSession = storage.session.getUserInfo()
  if (isInAppLogin(userInfoSession?.loginType)) {
    dkgShare = {
      id: userInfoSession?.userInfo.id,
      pk: userInfoSession?.pk,
    }
  } else {
    dkgShare = storage.local.getPK()
  }
  if (!dkgShare) {
    return
  }
  core = new Core(
    dkgShare.pk,
    dkgShare.id,
    appId,
    GATEWAY_URL,
    AUTH_NETWORK === 'dev'
  )
  securityQuestionModule.init(core)
  try {
    questions.value = await securityQuestionModule.getQuestions()
  } catch (e) {
    console.log(e)
  }
  loader.value = {
    show: false,
    message: '',
  }
})

function handleProceed(val: 'pin-based' | 'question-based') {
  recoveryMethod.value = val
}

function handleBack() {
  recoveryMethod.value = ''
}

async function handleAnswerBasedRecovery(ev) {
  loader.value = {
    show: true,
    message: 'Constructing private key...',
  }
  handleBack()
  try {
    const reconstructedShare = await securityQuestionModule.reconstructShare({
      answers: ev.answers,
    })
    const key = await core.getKey(reconstructedShare)
    if (isInAppLogin(userInfoSession?.loginType)) {
      await handleLocalRecovery(key)
      router.push({ name: 'home' })
    } else {
      returnToParent(key)
    }
  } catch (e) {
    console.error(e)
    toast.error('Incorrect answers')
  } finally {
    loader.value = {
      show: false,
      message: '',
    }
  }
}

async function handleLocalRecovery(key: string) {
  const userInfo = userInfoSession
  userInfo.privateKey = key
  storage.session.setUserInfo(userInfo)
  storage.session.setIsLoggedIn()
  user.setUserInfo(userInfo)
  user.setLoginStatus(true)
  if (!userInfo.hasMfa && userInfo.pk) {
    const core = new Core(
      userInfo.pk,
      userInfo.userInfo.id,
      `${appId}`,
      GATEWAY_URL,
      AUTH_NETWORK === 'dev'
    )
    const securityQuestionModule = new SecurityQuestionModule(3)
    securityQuestionModule.init(core)
    const isEnabled = await securityQuestionModule.isEnabled()
    user.hasMfa = isEnabled
  }
  if (userInfo.hasMfa) {
    user.hasMfa = true
    storage.local.setHasMFA(user.info.id)
  }
  storage.local.incrementLoginCount(userInfo.userInfo.id)
  app.expandWallet = true
  app.compactMode = false
  app.expandRestoreScreen = false
}

async function handlePinBasedRecovery(ev: any) {
  loader.value = {
    show: true,
    message: 'Constructing private key...',
  }
  handleBack()
  try {
    const reconstructedShare = await securityQuestionModule.reconstructShare({
      password: ev.password,
    })
    const key = await core.getKey(reconstructedShare)
    if (isInAppLogin(userInfoSession?.loginType)) {
      await handleLocalRecovery(key)
      router.push({ name: 'home' })
    } else {
      returnToParent(key)
    }
  } catch (e) {
    console.error(e)
    toast.error('Incorrect Pin')
  } finally {
    loader.value = {
      show: false,
      message: '',
    }
  }
}

async function returnToParent(key: string) {
  const connectionToParent = await connectToParent<RedirectParentConnectionApi>(
    {}
  ).promise
  const info = storage.local.getUserInfo()
  if (!info) {
    return
  }
  const loginSrc = storage.local.getLoginSrc()
  const state = storage.session.getState() as string

  const stateInfo = decodeJSON<StateInfo>(state)
  const isStandalone =
    loginSrc === 'rn' || loginSrc === 'flutter' || loginSrc === 'unity'

  storage.local.setHasMFA(info.userInfo.id)
  info.privateKey = key
  info.hasMfa = true

  const uuid = genUUID()
  storage.local.clearPK()
  storage.session.setIsLoggedIn()
  storage.session.setUserInfo(info)
  storage.local.setSession({
    sessionID: uuid,
    timestamp: Date.now(),
  })
  const messageId = getUniqueId()
  await handleLogin({
    state: stateInfo.i,
    isStandalone,
    userInfo: info,
    sessionID: uuid,
    sessionExpiry: Date.now() + EXPIRY_MS,
    messageId,
    connection: connectionToParent,
  }).catch(async (e) => {
    if (e instanceof Error) {
      reportError(e.message)
      return
    }
    reportError(e)
    storage.local.clearLoginSrc()
  })
}

onUnmounted(() => {
  if (channel) {
    channel.close()
  }
})
</script>

<template>
  <div
    class="card w-full max-w-[40rem] m-auto h-max min-h-max overflow-y-auto p-4"
  >
    <div
      v-show="loader.show"
      class="fixed inset-0 flex justify-center items-center z-50 opacity-90 backdrop-blur bg-white dark:bg-black"
    >
      <AppLoader :message="loader.message" />
    </div>
    <SecurityQuestionRecoveryModal
      v-if="recoveryMethod === 'question-based'"
      :questions="questions"
      @back="handleBack"
      @proceed="handleAnswerBasedRecovery"
      @switch-alternate="recoveryMethod = 'pin-based'"
    />
    <PinBasedRecoveryModal
      v-else-if="recoveryMethod === 'pin-based'"
      @back="handleBack"
      @proceed="handlePinBasedRecovery"
      @switch-alternate="recoveryMethod = 'question-based'"
    />
    <div v-else>
      <div class="flex gap-2 items-center mb-2">
        <div class="text-lg font-bold">
          New Device/Browser Detected: Verify Login
        </div>
      </div>
      <div class="flex text-sm text-gray-100">
        Enter your previously setup MFA PIN or answer the security questions to
        verify your login to this new device/browser.
      </div>
      <div class="flex mt-4 items-end justify-end gap-8">
        <button
          class="text-sm font-bold text-sm btn-tertiary p-2 uppercase"
          type="submit"
          @click.stop="handleProceed('pin-based')"
        >
          Enter Pin
        </button>
        <button
          class="text-sm font-bold text-sm btn-tertiary p-2 uppercase"
          type="submit"
          @click.stop="handleProceed('question-based')"
        >
          Answer Questions
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
label {
  padding-left: 5px;
  font-size: var(--fs-300);
  font-weight: 600;
  color: var(--fg-color-secondary);
}

hr {
  border-top: 1px solid #8d8d8d20;
}
</style>
