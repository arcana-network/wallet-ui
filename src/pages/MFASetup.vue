<script setup lang="ts">
import {
  Core,
  SecurityQuestionModule,
  utils as KeyHelperUtils,
} from '@arcana/key-helper'
import { connectToParent, type AsyncMethodReturns } from 'penpal'
import { ref, onBeforeMount, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'

import AppLoader from '@/components/AppLoader.vue'
import SearchQuestion from '@/components/SearchQuestion.vue'
import { RedirectParentConnectionApi } from '@/models/Connection'
import { GATEWAY_URL } from '@/utils/constants'
import { getStorage, initStorage } from '@/utils/storageWrapper'

type CustomObject = {
  [key: string]: string
}

const route = useRoute()
const toast = useToast()
const loader = ref({
  show: false,
  message: '',
})

const showPinScreen = ref(false)
const showSuccessScreen = ref(false)
const showPinError = ref('')
const pinToEncryptMFAShare = ref('')

const securityQuestionModule = new SecurityQuestionModule(3)

let globalQuestions: Ref<CustomObject> = ref({})
const totalQuestions = 5
const selectedQuestions: CustomObject[] = new Array(totalQuestions)
const error: Ref<boolean[]> = ref(new Array(totalQuestions).fill(false))

initStorage(String(route.params.appId))

const storage = getStorage()

document.documentElement.classList.add('dark')

let connectionToParent: AsyncMethodReturns<RedirectParentConnectionApi>

onBeforeMount(async () => {
  const dkgShare = JSON.parse(storage.local.getItem('pk') as string)
  connectionToParent = await connectToParent<RedirectParentConnectionApi>({})
    .promise
  if (new Date() < new Date(dkgShare.exp)) {
    const core = new Core(
      dkgShare.pk,
      dkgShare.id,
      String(route.params.appId),
      GATEWAY_URL
    )
    await core.init()
    securityQuestionModule.init(core)
    globalQuestions.value = await securityQuestionModule.getGlobalQuestions()
  } else {
    toast.error('Share expired. Please login again to continue')
  }
})

function addSelectedQuestion(index: number, value: any) {
  if (value) {
    const keyValue =
      value[0] === -1 ? KeyHelperUtils.randomNumber().toString() : value[0]
    const customQuestion = value[0] === -1 ? value[1] : undefined
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
      storage.local.removeItem('pk')
    } catch (e) {
      // eslint-disable-next-line no-undef
      return connectionToParent.error(e, process.env.VUE_APP_WALLET_DOMAIN)
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
  // eslint-disable-next-line no-undef
  // eslint-disable-next-line no-undef
  return connectionToParent.replyTo(process.env.VUE_APP_WALLET_DOMAIN)
}

function handleCancel() {
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
    class="wallet__card rounded-[10px] w-full max-w-[40rem] mx-auto h-max min-h-max px-2 py-12 overflow-y-auto"
  >
    <div class="flex flex-col max-w-[30rem] mx-auto">
      <div class="flex justify-center">
        <img src="@/assets/images/success.svg" />
      </div>
      <div class="flex flex-col text-center mt-10">
        <h2 class="font-semibold mb-5 title">
          ENHANCED WALLET SECURITY ENABLED
        </h2>
        <span class="description max-w-[26rem]"
          >You're all set with Two-Factor Authentication. If you change browsers
          or devices in the future, you may be asked to either answer the
          security questions or the PIN created in the last step.
        </span>
      </div>
      <div class="flex flex-col items-center mt-8 gap-4">
        <button
          class="text-sm sm:text-xs rounded-xl text-white dark:bg-white bg-black dark:text-black w-full max-w-[18rem] font-semibold uppercase"
          @click.stop="handleDone"
        >
          Done
        </button>
      </div>
    </div>
  </div>
  <div
    v-else-if="showPinScreen"
    class="wallet__card rounded-[10px] w-full max-w-[40rem] mx-auto h-max min-h-max overflow-y-auto"
  >
    <div
      v-show="loader.show"
      class="fixed inset-0 flex justify-center items-center z-50 opacity-90 backdrop-blur bg-white dark:bg-black"
    >
      <AppLoader :message="loader.message" />
    </div>
    <h2 class="font-semibold mb-5 title uppercase m-8">
      RECOVERY METHOD 2: PIN
    </h2>
    <hr />
    <form
      class="flex flex-col mt-8 gap-4 px-8 pb-8"
      @submit.prevent="handlePinProceed"
    >
      <div class="flex flex-col gap-1">
        <label>Pin to use for encryption</label>
        <input
          v-model.trim="pinToEncryptMFAShare"
          class="text-base p-4 input text-ellipsis overflow-hidden whitespace-nowrap"
          placeholder="Enter a alphanumberic pin, minimum 6 characters"
        />
        <span
          class="text-sm sm:text-xs pl-1 text-red-600"
          :class="{ invisible: !showPinError }"
          >{{ showPinError }}</span
        >
      </div>
      <div class="flex justify-end gap-4">
        <button
          type="reset"
          class="text-sm sm:text-xs rounded-xl text-black border-black border-2 dark:text-white dark:border-white w-full max-w-[144px] font-semibold uppercase"
          @click.stop="handlePinBack"
        >
          Back
        </button>
        <button
          type="submit"
          class="text-sm sm:text-xs rounded-xl text-white dark:bg-white bg-black dark:text-black w-full max-w-[144px] font-semibold uppercase"
        >
          Proceed
        </button>
      </div>
    </form>
  </div>
  <div
    v-else
    class="wallet__card rounded-[10px] w-full max-w-[40rem] mx-auto h-max min-h-max overflow-y-auto"
  >
    <h2 class="font-semibold mb-5 title uppercase m-8">
      RECOVERY METHOD 1: Security Questions
    </h2>
    <hr />
    <form class="flex flex-col p-8 gap-12" @submit.prevent="handleSubmit">
      <div
        v-for="i in totalQuestions"
        :key="`Security-Question-${i}`"
        class="flex flex-col gap-2"
      >
        <div class="flex flex-col gap-1">
          <label>Question {{ i }}</label>
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
          <label>Answer {{ i }}</label>
          <input
            class="text-base p-4 input text-ellipsis overflow-hidden whitespace-nowrap"
            placeholder="Enter the answer"
            :value="getAnswer(i)"
            @input="addAnswer(i, $event.target?.value)"
          />
        </div>
      </div>
      <div class="flex justify-end gap-4">
        <button
          type="reset"
          class="text-sm sm:text-xs rounded-xl text-black border-black border-2 dark:text-white dark:border-white w-full max-w-[144px] font-semibold uppercase"
          @click.stop="handleCancel"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="text-sm sm:text-xs rounded-xl text-white dark:bg-white bg-black dark:text-black w-full max-w-[144px] font-semibold uppercase"
        >
          Proceed
        </button>
      </div>
    </form>
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
