<script setup lang="ts">
import { Theme } from '@arcana/auth'
import { useHeadSafe } from 'unhead'
import { ref } from 'vue'
import { useRoute } from 'vue-router'

import SearchQuestion from '@/components/SearchQuestion.vue'

const route = useRoute()
const theme = route.query.theme as Theme
const showPinScreen = ref(false)
const showError = ref(false)

document.documentElement.classList.add(theme)

useHeadSafe({
  title: 'Setup Multifactor Authentication | Arcana Wallet',
})

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
        <h2 class="font-semibold mb-5 title mb-4">MFA Setup Complete</h2>
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
            class="text-base p-4 input text-ellipsis overflow-hidden whitespace-nowrap"
            placeholder="Enter a alphanumberic pin, minimum 6 characters"
          />
          <span
            class="text-sm sm:text-xs pl-1 text-red-600"
            :class="{ invisible: !showError }"
            >This is an error</span
          >
        </div>
        <div class="flex flex-col gap-1">
          <label>Email ID</label>
          <input
            class="text-base p-4 input text-ellipsis overflow-hidden whitespace-nowrap"
            placeholder="Enter the email id"
          />
          <span
            class="text-sm sm:text-xs pl-1 text-red-600"
            :class="{ invisible: !showError }"
            >This is an error</span
          >
        </div>
      </div>
      <div class="flex flex-col items-center mt-8 gap-4">
        <button
          class="text-sm sm:text-xs flex gap-2 uppercase text-black dark:text-white font-semibold items-center"
          @click.stop="showError = !showError"
        >
          <img
            src="@/assets/images/download.svg"
            class="invert dark:invert-0"
          />
          Download
        </button>
        <button
          class="text-sm sm:text-xs rounded-xl text-white dark:bg-white bg-black dark:text-black w-full max-w-[18rem] font-semibold uppercase"
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
    <form class="flex flex-col p-8 gap-4" @submit.prevent="void 0">
      <div class="flex flex-col gap-1">
        <label>Question 1</label>
        <SearchQuestion />
      </div>
      <div class="flex flex-col gap-1">
        <label>Answer 1</label>
        <input
          class="text-base p-4 input text-ellipsis overflow-hidden whitespace-nowrap"
          placeholder="Enter the answer"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label>Question 2</label>
        <SearchQuestion />
      </div>
      <div class="flex flex-col gap-1">
        <label>Answer 2</label>
        <input
          class="text-base p-4 input text-ellipsis overflow-hidden whitespace-nowrap"
          placeholder="Enter the answer"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label>Question 3</label>
        <SearchQuestion />
      </div>
      <div class="flex flex-col gap-1">
        <label>Answer 3</label>
        <input
          class="text-base p-4 input text-ellipsis overflow-hidden whitespace-nowrap"
          placeholder="Enter the answer"
        />
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
          @click.stop="showPinScreen = true"
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
