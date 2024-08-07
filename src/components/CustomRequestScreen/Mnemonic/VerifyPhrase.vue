<script setup lang="ts">
import { ref, type Ref, computed, watch } from 'vue'

import AppLoader from '@/components/AppLoader.vue'
import { getImage } from '@/utils/getImage'
import { getStorage } from '@/utils/storageWrapper'

const emit = defineEmits(['success', 'close'])

const isLoading = ref(false)
const currentPage = ref(1)
const correctAnswersCount = ref(0)
const isError = ref(false)
const isCorrect = ref(false)
const selectedAnswer = ref('')

const storage = getStorage()
const mnemonic = storage.session.getMnemonic()
const keyArray: string[] = mnemonic.split(' ')

const selectedIndex = ref<number>(-1)
const correctOption = ref<string>('')
const options = ref<string[]>([])

function generateOptions(correctOption: string): string[] {
  const randomOptions = keyArray.filter((item) => item !== correctOption)
  randomOptions.sort(() => 0.5 - Math.random())
  return [correctOption, ...randomOptions.slice(0, 4)].sort(
    () => 0.5 - Math.random()
  )
}

function updatePageContent() {
  selectedIndex.value = Math.floor(Math.random() * keyArray.length)
  correctOption.value = keyArray[selectedIndex.value]
  options.value = generateOptions(correctOption.value)
  selectedAnswer.value = ''
}

const Hint = computed(
  () =>
    `${selectedIndex.value + 1}.   ${selectedAnswer.value}` ||
    `${selectedIndex.value + 1}.`
)
function goToNextPage() {
  if (currentPage.value < 3) {
    currentPage.value += 1
    updatePageContent()
  }
}

function selectOption(option: string) {
  selectedAnswer.value = option
  if (option === correctOption.value) {
    isCorrect.value = true
    isError.value = false
    correctAnswersCount.value += 1
    if (correctAnswersCount.value === 3) {
      emit('success')
    } else {
      setTimeout(() => {
        isCorrect.value = false
        goToNextPage()
      }, 1000)
    }
  } else {
    isError.value = true
    isCorrect.value = false
    correctAnswersCount.value = 0
    setTimeout(() => {
      isError.value = false
      resetToFirstPage()
    }, 2000)
  }
}

function resetToFirstPage() {
  currentPage.value = 1
  updatePageContent()
}

watch(
  currentPage,
  (newPage) => {
    if (newPage === 1 || newPage === 2 || newPage === 3) {
      updatePageContent()
    }
  },
  { immediate: true }
)

updatePageContent()
</script>

<template>
  <div>
    <AppLoader v-if="isLoading" message="Processing..." />
    <div v-else class="flex flex-col p-1">
      <div class="flex flex-col gap-2">
        <p class="font-Nohemi font-semibold text-center text-xl">
          Verify Recording
        </p>
        <p class="text-sm text-center text-zinc-400">
          Now make sure that you have recorded the seed phrase correctly by
          selecting the correct option below.
        </p>
      </div>
      <div v-if="currentPage === 1 || currentPage === 2 || currentPage === 3">
        <form class="flex flex-col items-center p-5 gap-3">
          <div class="relative w-36">
            <input
              type="text"
              :placeholder="Hint"
              class="input-tertiary w-36"
              :class="{
                'border-2 border-red-system': isError,
                'border-2 border-green-500': isCorrect,
              }"
              readonly
            />
            <img
              v-if="isCorrect"
              src="@/assets/images/success-fill.svg"
              alt="Success"
              class="absolute right-2 top-1/2 transform -translate-y-1/2"
            />
            <img
              v-if="isError"
              src="@/assets/images/incorrect-fill.svg"
              alt="Error"
              class="absolute right-2 top-1/2 transform -translate-y-1/2"
            />
          </div>
        </form>
        <div class="flex flex-wrap justify-center gap-2 mt-4">
          <button
            v-for="option in options"
            :key="option"
            class="btn-form w-36"
            @click="selectOption(option)"
          >
            {{ option }}
          </button>
        </div>
      </div>
      <div
        v-if="isError"
        class="flex flex-row gap-2 bg-red-system p-2 rounded-[8px] mt-3"
      >
        <img src="@/assets/images/incorrect.svg" class="h-8 w-8" alt="Error" />
        <p class="text-xs text-white-100">
          This choice is incorrect. Please select the correct word and proceed
          to verify 3 more words.
        </p>
      </div>
      <div class="flex justify-center mt-1">
        <div v-for="page in 3" :key="page" class="mx-1">
          <span
            :class="{
              'w-2 h-2 rounded-full inline-block': true,
              'bg-gray-400': currentPage < page,
              'bg-gray-500': currentPage >= page,
            }"
          ></span>
        </div>
      </div>
      <form
        class="flex flex-col mt-5 space-y-4"
        @submit.prevent="emit('close')"
      >
        <button
          class="btn-primary py-[10px]"
          type="submit"
          :disabled="isError || isCorrect"
        >
          Back to Seed Phrase
        </button>
      </form>
      <img
        :src="getImage('secured-by-arcana.svg')"
        class="h-3 select-none mt-5"
      />
    </div>
  </div>
</template>
