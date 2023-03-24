<script setup lang="ts">
import { Theme } from '@arcana/auth'
import {
  Core,
  SecurityQuestionModule,
  utils as KeyHelperUtils,
} from '@arcana/key-helper'
import { ref, onBeforeMount, type Ref } from 'vue'
import { useRoute } from 'vue-router'

import SearchQuestion from '@/components/SearchQuestion.vue'
import { GATEWAY_URL } from '@/utils/constants'
import { getStorage, initStorage } from '@/utils/storageWrapper'

const route = useRoute()
const theme = route.query.theme as Theme
const showPinScreen = ref(false)
const showError = ref(false)
const pinToEncryptMFAShare = ref('')
const securityQuestionModule = new SecurityQuestionModule(3)
let globalQuestions: Ref<{
  [key: number]: string
}> = ref({})
const totalQuestions = 5
const selectedQuestions: {
  [key: string]: string
}[] = new Array(totalQuestions)

initStorage(String(route.params.appId))
document.documentElement.classList.add(theme)

onBeforeMount(async () => {
  const dkgShare = JSON.parse(getStorage().local.getItem('pk') as string)
  if (new Date() < new Date(dkgShare.exp)) {
    const core = new Core(
      dkgShare.pk,
      String(route.query.email),
      String(route.params.appId),
      GATEWAY_URL
    )
    await core.init()
    securityQuestionModule.init(core)
    globalQuestions.value = await securityQuestionModule.getGlobalQuestions()
  } else {
    console.log('Expired')
  }
})

function addSelectedQuestion(index: number, value: any) {
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

function addAnswer(index: number, value: string) {
  if (selectedQuestions[index - 1]) {
    selectedQuestions[index - 1]['value'] = value
  } else {
    selectedQuestions[index - 1] = { value }
  }
}

async function createShare(pin?: string) {
  const answers = selectedQuestions.reduce((obj, val) => {
    obj[val.key] = val.value
    return obj
  }, {})
  const customQuestions = selectedQuestions.reduce((obj, val) => {
    if (val.customQuestion) obj[val.key] = val.customQuestion
    return obj
  }, {})
  console.log({ answers, customQuestions, pin })
  const createShareProps: any = { answers }
  if (Object.keys(customQuestions).length) {
    createShareProps.customQuestions = customQuestions
  }
  if (pin) {
    createShareProps.password = pin
  }
  return await securityQuestionModule.createShare(createShareProps)
}

async function handleSubmit() {
  showPinScreen.value = true
}

async function handleDownload() {
  const encryptedText = await createShare(pinToEncryptMFAShare.value)
  console.log(encryptedText)
}

async function handleDone() {
  const encryptedText = await createShare(pinToEncryptMFAShare.value)
  console.log(encryptedText)
}

function handleCancel() {
  window.close()
}
</script>

<template>
  <div
    v-if="showPinScreen"
    class="wallet__card rounded-[10px] w-full max-w-[40rem] mx-auto h-max min-h-max px-2 py-12 overflow-y-auto"
  >
    <div class="flex flex-col max-w-[30rem] mx-auto">
      <div class="flex justify-center">
        <img src="@/assets/images/success.svg" />
      </div>
      <div class="flex flex-col text-center mt-10">
        <h2 class="font-semibold mb-5 title">MFA Setup Complete</h2>
        <span class="description max-w-[26rem]"
          >You’re all set with Multi-Factor Authentication. You can back-up your
          answers to your security questions using one of the following methods
          after you provide a PIN to encrypt the file.
        </span>
      </div>
      <div class="flex flex-col mt-8 gap-4">
        <div class="flex flex-col gap-1">
          <label>Pin to use for encryption</label>
          <input
            v-model.trim="pinToEncryptMFAShare"
            class="text-base p-4 input text-ellipsis overflow-hidden whitespace-nowrap"
            placeholder="Enter a alphanumberic pin, minimum 6 characters"
          />
          <span
            class="text-sm sm:text-xs pl-1 text-red-600"
            :class="{ invisible: !showError }"
            >Pin should be 6 characters long</span
          >
        </div>
      </div>
      <div class="flex flex-col items-center mt-8 gap-4">
        <button
          class="text-sm sm:text-xs flex gap-2 uppercase text-black dark:text-white font-semibold items-center"
          @click.stop="handleDownload"
        >
          <img
            src="@/assets/images/download.svg"
            class="invert dark:invert-0"
          />
          Download
        </button>
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
    v-else
    class="wallet__card rounded-[10px] w-full max-w-[40rem] mx-auto h-max min-h-max overflow-y-auto"
  >
    <h2 class="font-semibold mb-5 title uppercase m-8">Security Questions</h2>
    <hr />
    <form class="flex flex-col p-8 gap-4" @submit.prevent="handleSubmit">
      <div
        v-for="i in totalQuestions"
        :key="`Security-Question-${i}`"
        class="flex flex-col gap-4"
      >
        <div class="flex flex-col gap-1">
          <label>Question {{ i }}</label>
          <SearchQuestion
            :questions="globalQuestions"
            @change="addSelectedQuestion(i, $event)"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label>Answer {{ i }}</label>
          <input
            class="text-base p-4 input text-ellipsis overflow-hidden whitespace-nowrap"
            placeholder="Enter the answer"
            @input="addAnswer(i, $event.target?.value)"
          />
        </div>
      </div>
      <div class="flex justify-end gap-2 mt-12">
        <button
          class="text-sm sm:text-xs rounded-xl text-black border-black border-2 dark:text-white dark:border-white w-full max-w-[144px] font-semibold uppercase"
          @click.stop="handleCancel"
        >
          Cancel
        </button>
        <button
          class="text-sm sm:text-xs rounded-xl text-white dark:bg-white bg-black dark:text-black w-full max-w-[144px] font-semibold uppercase"
        >
          Save
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
