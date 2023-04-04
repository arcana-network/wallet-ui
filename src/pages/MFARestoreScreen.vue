<script setup lang="ts">
import { Core, SecurityQuestionModule } from '@arcana/key-helper'
import { getUniqueId } from 'json-rpc-engine'
import { connectToParent } from 'penpal'
import { ref, onBeforeMount, onUnmounted, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'

import AppLoader from '@/components/AppLoader.vue'
import PinBasedRecoveryModal from '@/components/PinBasedRecoveryModal.vue'
import SecurityQuestionRecoveryModal from '@/components/SecurityQuestionRecoveryModal.vue'
import type { RedirectParentConnectionApi } from '@/models/Connection'
import { useModalStore } from '@/store/modal'
import { GATEWAY_URL } from '@/utils/constants'
import {
  handlePasswordlessLogin,
  handlePasswordlessLoginV2,
  handleSocialLogin,
} from '@/utils/redirectUtils'
import { getStorage, initStorage } from '@/utils/storageWrapper'

const modalStore = useModalStore()
const toast = useToast()
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
  exp: string
  id: string
}
let channel: BroadcastChannel
const route = useRoute()
const appId = route.params.appId as string
initStorage(appId)
const storage = getStorage()

onBeforeMount(async () => {
  loader.value = {
    show: true,
    message: 'Loading metadata...',
  }
  dkgShare = JSON.parse(storage.local.getItem('pk') as string)
  core = new Core(dkgShare.pk, dkgShare.id, appId, GATEWAY_URL)
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
  modalStore.setShowModal(true)
  recoveryMethod.value = val
}

function handleBack() {
  modalStore.setShowModal(false)
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
    returnToParent(key)
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
    returnToParent(key)
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
  const info = JSON.parse(storage.session.getItem('info') as string)
  const parentAppUrl = storage.local.getItem('parentAppUrl') as string
  const loginSrc = storage.local.getItem('loginSrc')
  storage.local.setItem(`${info.userInfo.id}-has-mfa`, '1')
  info.privateKey = key
  info.hasMfa = true
  storage.local.removeItem('pk')
  const messageId = getUniqueId()
  if (info.loginType === 'passwordless') {
    await handlePasswordlessLoginV2(info, connectionToParent).catch(
      async () => {
        channel = new BroadcastChannel(`${appId}_login_notification`)
        await handlePasswordlessLogin(
          info,
          messageId,
          parentAppUrl,
          connectionToParent,
          channel
        )
      }
    )
  } else {
    if (loginSrc === 'rn') {
      await connectionToParent.goToWallet()
      return
    }
    await handleSocialLogin(info, messageId, parentAppUrl, connectionToParent)
  }
}

onUnmounted(() => {
  if (channel) {
    channel.close()
  }
})
</script>

<template>
  <div
    class="wallet__card rounded-[10px] w-full max-w-[40rem] m-auto h-max min-h-max overflow-y-auto p-8"
  >
    <div
      v-show="loader.show"
      class="fixed inset-0 flex justify-center items-center z-50 opacity-90 backdrop-blur bg-white dark:bg-black"
    >
      <AppLoader :message="loader.message" />
    </div>
    <div class="flex gap-2 items-center mb-2">
      <div class="modal-title font-bold">Enter MFA details to continue</div>
    </div>
    <div class="flex" style="font-size: var(--fs-300)">
      We could not find the local MFA key information on this device.<br />
      To recover, please answer the security questions or provide the PIN used
      during the MFA setup.
    </div>
    <div class="flex mt-4 items-end justify-end gap-8">
      <button
        class="text-sm sm:text-xs font-semibold text-black bg-transparent dark:text-white h-10 sm:h-8 uppercase"
        type="submit"
        @click.stop="handleProceed('pin-based')"
      >
        Provide Pin
      </button>
      <button
        class="text-sm sm:text-xs font-semibold text-black bg-transparent dark:text-white h-10 sm:h-8 uppercase"
        type="submit"
        @click.stop="handleProceed('question-based')"
      >
        Answer Questions
      </button>
    </div>
    <Teleport v-if="modalStore.show" to="#modal-container">
      <SecurityQuestionRecoveryModal
        v-if="recoveryMethod === 'question-based'"
        :questions="questions"
        @back="handleBack"
        @proceed="handleAnswerBasedRecovery"
      />
      <PinBasedRecoveryModal
        v-if="recoveryMethod === 'pin-based'"
        @back="handleBack"
        @proceed="handlePinBasedRecovery"
      />
    </Teleport>
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

.title {
  font-size: var(--fs-500);
}

.description {
  font-size: var(--fs-250);
  color: var(--fg-color-secondary);
}
</style>
