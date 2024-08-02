<script setup lang="ts">
import { ref, type Ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

import AppLoader from '@/components/AppLoader.vue'
import { getImage } from '@/utils/getImage'

const router = useRouter()
const toast = useToast()

const emit = defineEmits(['success', 'close'])

const isLoading = ref(false)
const showStatusModal: Ref<'success' | 'failed' | 'cancelled' | ''> = ref('')
const statusText = ref({
  title: '',
  message: '',
})
const currentPage = ref(1)
const correctAnswersCount = ref(0)
const isError = ref(false)
const isCorrect = ref(false)
const selectedAnswer = ref('')

const keyArray: string[] = [
  'Plug',
  'Risk',
  'Opera',
  'Liar',
  'Sudden',
  'Receive',
  'Stuff',
  'Mask',
  'Donate',
  'Mammal',
  'Night',
  'Stable',
  'Direct',
  'Antique',
  'Grocery',
  'Believe',
  'Town',
  'Peasant',
  'Hole',
  'Put',
  'Satoshi',
  'Flavor',
  'Oxygen',
  'Spin',
]

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
    `${selectedIndex.value + 1}.____________________`
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
    toast.success('Correct Answer, Select the next word.')
    correctAnswersCount.value += 1
    if (correctAnswersCount.value === 3) {
      toast.success('All answers are correct!')
      emit('success')
    } else {
      setTimeout(() => {
        isCorrect.value = false
        goToNextPage()
      }, 2000)
    }
  } else {
    isError.value = true
    resetToFirstPage()
  }
}

function resetToFirstPage() {
  currentPage.value = 1
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
      <div class="flex flex-col gap-3">
        <p class="font-Nohemi font-medium text-center text-xl">
          Verify Recording
        </p>
        <p class="text-sm text-center text-zinc-400">
          Now make sure that you have recorded the seed phrase correctly by
          selecting the correct option below.
        </p>
      </div>
      <div v-if="currentPage === 1 || currentPage === 2 || currentPage === 3">
        <form class="flex flex-col items-center p-10 gap-3">
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
      <div v-if="isError" class="bg-red-system p-2 rounded-[8px] mt-3">
        <p class="text-xs text-center text-white-100">
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
        <button class="btn-primary py-[10px]" type="submit">
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
