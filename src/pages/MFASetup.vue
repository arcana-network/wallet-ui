<script setup lang="ts">
import {
  Core,
  SecurityQuestionModule,
  utils as KeyHelperUtils,
} from '@jrstudio/key-helper-legacy'
import { connectToParent, type AsyncMethodReturns } from 'penpal'
import { ref, onBeforeMount, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

import AppLoader from '@/components/AppLoader.vue'
import SearchQuestion from '@/components/SearchQuestion.vue'
import { RedirectParentConnectionApi } from '@/models/Connection'
import { GATEWAY_URL, AUTH_NETWORK } from '@/utils/constants'
import { getImage } from '@/utils/getImage'
import { isInAppLogin } from '@/utils/isInAppLogin'
import { getStorage, initStorage } from '@/utils/storageWrapper'

type CustomObject = {
  [key: string]: string
}

const route = useRoute()
const router = useRouter()
const toast = useToast()
const loader = ref({
  show: false,
  message: '',
})

const showPinScreen = ref(false)
const showSuccessScreen = ref(false)
const showPinError = ref('')
const pinToEncryptMFAShare = ref('')
const passwordType = ref('password')

const securityQuestionModule = new SecurityQuestionModule(3)

let globalQuestions: Ref<CustomObject> = ref({})
const totalQuestions = 5
const selectedQuestions: CustomObject[] = new Array(totalQuestions)
const error: Ref<boolean[]> = ref(new Array(totalQuestions).fill(false))
const customPlaceholders: Ref<string[]> = ref(
  new Array(totalQuestions).fill('Enter the answer')
)

initStorage(String(route.params.appId))

const storage = getStorage()

document.documentElement.classList.add('dark')

let connectionToParent: AsyncMethodReturns<RedirectParentConnectionApi>
let loginInfo

onBeforeMount(async () => {
  const loginInfo = storage.local.getUserInfo()
  if (!loginInfo) {
    return
  }
  let dkgShare
  if (loginInfo) {
    dkgShare = {
      pk: loginInfo.pk,
      id: loginInfo.userInfo.id,
    }
  } else {
    dkgShare = storage.local.getPK()
  }
  if (!isInAppLogin(loginInfo?.loginType)) {
    connectionToParent = await connectToParent<RedirectParentConnectionApi>({})
      .promise
  }
  const core = new Core(
    dkgShare.pk,
    dkgShare.id,
    String(route.params.appId),
    GATEWAY_URL,
    AUTH_NETWORK === 'dev'
  )
  try {
    await core.init()
  } catch (e) {
    toast.error(e as string)
  }
  securityQuestionModule.init(core)
  globalQuestions.value = await securityQuestionModule.getGlobalQuestions()
})

function addSelectedQuestion(index: number, value: any) {
  if (value) {
    const keyValue =
      value[0] === -1 ? KeyHelperUtils.randomNumber().toString() : value[0]
    const customQuestion = value[0] === -1 ? value[1] : undefined
    const example = value[1]?.example ? value[1].example : 'Enter the answer'
    customPlaceholders.value[index - 1] = example
    if (selectedQuestions[index - 1]) {
      selectedQuestions[index - 1]['key'] = keyValue
      selectedQuestions[index - 1]['customQuestion'] = customQuestion
    } else {
      selectedQuestions[index - 1] = { key: keyValue, customQuestion }
    }
  }
  if (isQuestionRepeated(index)) {
    error.value[index - 1] = true
  } else {
    error.value[index - 1] = false
  }
}

function getSelectedQuestion(index: number) {
  if (selectedQuestions[index - 1]) {
    return (
      selectedQuestions[index - 1]['customQuestion'] ||
      globalQuestions.value[selectedQuestions[index - 1]['key']]
    )
  }
  return ''
}

function getAnswer(index: number) {
  if (selectedQuestions[index - 1]) {
    return selectedQuestions[index - 1]['value']
  }
  return ''
}

function addAnswer(index: number, value: string) {
  if (selectedQuestions[index - 1]) {
    selectedQuestions[index - 1]['value'] = value?.trim()
  } else {
    selectedQuestions[index - 1] = { value: value?.trim() }
  }
}

let answers: CustomObject
let customQuestions: CustomObject

async function createShare(pin: string) {
  const createShareProps: any = { answers }
  createShareProps.customQuestions = customQuestions
  createShareProps.password = pin
  return await securityQuestionModule.createShare(createShareProps)
}

function validatePin(pin?: string) {
  let returnValue = false
  showPinError.value = ''
  if (!pin) {
    showPinError.value = 'Pin is required for encryption'
    return toast.error(showPinError.value)
  }

  if (pin.includes(' ') || pin.includes('/t') || pin.includes('/n')) {
    showPinError.value = 'Pin should not contain spaces'
  }

  if (pin.length < 6) {
    showPinError.value = 'Pin should be minimum 6 characters long'
  }

  if (pin.length > 25) {
    showPinError.value = 'Pin should not be longer than 25 characters'
  }

  if (showPinError.value) {
    toast.error(showPinError.value)
  } else {
    returnValue = true
  }

  return returnValue
}

function isQuestionRepeated(index: number) {
  if (selectedQuestions[index - 1]?.key) {
    for (let i = 0; i < selectedQuestions.length; i++) {
      if (i !== index - 1) {
        if (selectedQuestions[i]?.key === selectedQuestions[index - 1]?.key) {
          return true
        }
        if (selectedQuestions[index - 1]?.customQuestion?.trim()) {
          if (
            selectedQuestions[i]?.customQuestion?.trim() ===
            selectedQuestions[index - 1]?.customQuestion?.trim()
          ) {
            return true
          }
        }
      }
    }
  }
  return false
}

async function handleSubmit() {
  const isAllQuestionsAnswered = selectedQuestions.every(
    (question) => question.key?.trim() && question.value?.trim()
  )
  if (!isAllQuestionsAnswered) {
    return toast.error('Please fill in all the questionnaires')
  }

  let hasSameQuestions = false

  answers = selectedQuestions.reduce((obj, val) => {
    if (obj[val.key]) {
      hasSameQuestions = true
    }
    obj[val.key] = val.value
    return obj
  }, {})

  let hasEmptyCustomQuestion = false

  customQuestions = selectedQuestions.reduce((obj, val) => {
    const customQuestion = val.customQuestion?.trim()
    if (val.customQuestion && !customQuestion) hasEmptyCustomQuestion = true
    if (Object.values(obj).includes(customQuestion)) hasSameQuestions = true
    if (val.customQuestion) obj[val.key] = customQuestion
    return obj
  }, {})

  if (hasSameQuestions) {
    return toast.error('Questions should not be repeated')
  }

  if (hasEmptyCustomQuestion) {
    return toast.error('Questions should not be empty')
  }

  showPinScreen.value = true
}

async function handlePinProceed() {
  const isPinValid = validatePin(pinToEncryptMFAShare.value)

  if (isPinValid) {
    loader.value = {
      show: true,
      message: 'Setting up MFA...',
    }
    try {
      await createShare(pinToEncryptMFAShare.value)
      if (!isInAppLogin(loginInfo?.loginType)) {
        const dkgShare = storage.local.getPK()
        storage.local.setHasMFA(dkgShare.id)
        storage.local.clearPK()
      }
    } catch (e) {
      if (isInAppLogin(loginInfo?.loginType)) {
        return toast.error(e as string)
      }
      return connectionToParent.error(
        e as string,
        // eslint-disable-next-line no-undef
        process.env.VUE_APP_WALLET_DOMAIN
      )
    }
    loader.value = {
      show: false,
      message: '',
    }
    showPinScreen.value = false
    showSuccessScreen.value = true
  }
}

async function handleDone() {
  if (isInAppLogin(loginInfo?.loginType)) {
    return router.push({ name: 'home' })
  }
  // eslint-disable-next-line no-undef
  return connectionToParent.replyTo(process.env.VUE_APP_WALLET_DOMAIN)
}

function handleCancel() {
  if (isInAppLogin(loginInfo?.loginType)) {
    return router.back()
  }
  return connectionToParent.error(
    'User cancelled the setup',
    // eslint-disable-next-line no-undef
    process.env.VUE_APP_WALLET_DOMAIN
  )
}

function handlePinBack() {
  showSuccessScreen.value = false
  showPinScreen.value = false
}
</script>

<template>
  <div
    v-if="showSuccessScreen"
    class="card w-full max-w-[40rem] mx-auto h-max min-h-max px-2 py-8 overflow-y-auto"
  >
    <div class="flex flex-col max-w-[30rem] mx-auto">
      <div class="flex justify-center">
        <img src="@/assets/images/success.svg" class="w-20 h-20" />
      </div>
      <div class="flex flex-col gap-5 text-center items-center mt-10">
        <h2 class="font-bold text-lg uppercase">
          ENHANCED WALLET SECURITY ENABLED
        </h2>
        <span class="text-sm max-w-[26rem]"
          >You're all set with Multi-factor Authentication. If you change
          browsers or devices in the future, you may be asked to either answer
          the security questions or enter the pin created in the last step.
        </span>
      </div>
      <div class="flex flex-col items-center mt-8 gap-4">
        <button
          class="btn-primary p-2 text-sm font-bold uppercase w-40"
          @click.stop="handleDone"
        >
          Done
        </button>
      </div>
    </div>
  </div>
  <div
    v-else-if="showPinScreen"
    class="card w-full max-w-[40rem] mx-auto h-max min-h-max overflow-y-auto"
  >
    <div
      v-show="loader.show"
      class="fixed inset-0 flex justify-center items-center z-50 opacity-90 backdrop-blur bg-white dark:bg-black"
    >
      <AppLoader :message="loader.message" />
    </div>
    <h2 class="font-bold text-lg uppercase m-4">RECOVERY METHOD 2: PIN</h2>
    <hr />
    <div class="m-4 text-sm text-gray-100">
      Enter a 6 digit, alphanumeric pin that you can use to retrieve your wallet
      if you move to a new device or browser.
    </div>
    <form
      class="flex flex-col mt-6 gap-4 px-4 pb-8"
      @submit.prevent="handlePinProceed"
    >
      <div class="flex flex-col gap-1">
        <label class="font-medium text-sm">Pin to use for encryption</label>
        <div class="relative">
          <input
            v-model.trim="pinToEncryptMFAShare"
            :type="passwordType"
            class="text-sm py-2 px-4 input-field focus:input-active focus-visible:input-active text-ellipsis overflow-hidden whitespace-nowrap w-full"
            placeholder="Enter a alphanumberic pin, minimum 6 characters"
          />
          <img
            v-if="passwordType === 'password'"
            :src="getImage('eye.svg')"
            class="absolute top-[50%] right-4 w-lg h-lg cursor-pointer"
            style="transform: translateY(-50%)"
            title="Show password"
            @click.stop="passwordType = 'text'"
          />
          <img
            v-else
            :src="getImage('eye-off.svg')"
            class="absolute top-[50%] right-4 w-lg h-lg cursor-pointer"
            style="transform: translateY(-50%)"
            title="Hide password"
            @click.stop="passwordType = 'password'"
          />
        </div>
        <span
          class="text-sm sm:text-xs pl-1 text-red-600"
          :class="{ invisible: !showPinError }"
          >{{ showPinError }}</span
        >
      </div>
      <div class="flex justify-end gap-4">
        <button
          type="reset"
          class="btn-secondary uppercase text-sm font-bold p-2 w-[8rem]"
          @click.stop="handlePinBack"
        >
          Back
        </button>
        <button
          type="submit"
          class="btn-primary uppercase text-sm font-bold p-2 w-[8rem]"
        >
          Proceed
        </button>
      </div>
    </form>
  </div>
  <div v-else class="card w-full max-w-[40rem] mx-auto h-max min-h-max">
    <div class="overflow-y-auto">
      <h2 class="font-bold text-base uppercase m-4">
        RECOVERY METHOD 1: Security Questions
      </h2>
      <hr />
      <form class="flex flex-col p-4 gap-6" @submit.prevent="handleSubmit">
        <div
          v-for="i in totalQuestions"
          :key="`Security-Question-${i}`"
          class="flex flex-col gap-2"
        >
          <div class="flex flex-col gap-1">
            <label class="text-sm">Question {{ i }}</label>
            <SearchQuestion
              :questions="globalQuestions"
              :value="getSelectedQuestion(i)"
              @change="addSelectedQuestion(i, $event)"
            />
            <div
              v-if="error[i - 1]"
              class="mt-1 ml-2 text-red-500 text-xs font-medium"
            >
              Questions cannot be repeated
            </div>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm">Answer {{ i }}</label>
            <input
              class="text-sm py-2 px-4 input-field text-ellipsis overflow-hidden whitespace-nowrap focus:input-active"
              :placeholder="customPlaceholders[i - 1]"
              :value="getAnswer(i)"
              @input="addAnswer(i, $event.target?.value)"
            />
          </div>
        </div>
        <div class="flex justify-end gap-4">
          <button
            type="reset"
            class="btn-secondary text-sm font-bold uppercase p-2 w-32"
            @click.stop="handleCancel"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn-primary text-sm font-bold uppercase p-2 w-32"
          >
            Proceed
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
hr {
  border-top: 1px solid #8d8d8d20;
}
</style>
