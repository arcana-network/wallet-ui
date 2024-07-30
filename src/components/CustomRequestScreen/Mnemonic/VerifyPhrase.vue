<script setup lang="ts">
import { ref, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

import AppLoader from '@/components/AppLoader.vue'
import { getImage } from '@/utils/getImage'

const emit = defineEmits(['close'])
const router = useRouter()
const toast = useToast()

const isLoading = ref(false)
const showStatusModal: Ref<'success' | 'failed' | 'cancelled' | ''> = ref('')
const statusText = ref({
  title: '',
  message: '',
})
const currentPage = ref(1)
const correctOption = 'Option 1' // Define the correct option text
const correctAnswersCount = ref(0) // Counter for correct answers

function handleCancel() {
  router.push({ name: 'home' })
  return emit('close')
}

function handleDisplay() {
  router.push({ name: 'SeedPhraseMVX' })
  return emit('close')
}

function goToNextPage() {
  if (currentPage.value < 3) {
    currentPage.value += 1
  }
}

function goToPreviousPage(event: Event) {
  event.preventDefault()
  if (currentPage.value > 1) {
    currentPage.value -= 1
  }
}

function selectOption(option: string) {
  if (option === correctOption) {
    correctAnswersCount.value += 1
    if (currentPage.value === 1 && correctAnswersCount.value === 2) {
      toast.success('All answers are correct!')
    } else if (currentPage.value === 1) {
      goToNextPage()
    } else if (currentPage.value === 2 && correctAnswersCount.value === 2) {
      toast.success('All answers are correct!')
    } else {
      goToNextPage()
    }
  } else {
    toast.error('Incorrect option. Please try again.')
    if (currentPage.value === 1) {
      goToNextPage()
    } else if (currentPage.value === 2) {
      goToNextPage()
    }
  }
}
</script>

<template>
  <div>
    <AppLoader v-if="isLoading" message="Processing..." />
    <div v-else class="flex flex-col p-1">
      <div class="flex flex-col gap-3">
        <p class="font-Nohemi font-medium text-center text-xl">
          Verify Recording
        </p>
        <p class="text-xs text-center text-zinc-400">
          Now make sure that you have recorded the seed phrase correctly by
          selecting the correct option below.
        </p>
      </div>

      <!-- Page Content Based on currentPage -->
      <div v-if="currentPage === 1">
        <!-- Input Form and Options for Page 1 -->
        <form class="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Your selected option will appear here"
            class="border border-gray-300 p-2"
            readonly
            :value="selectedOption"
          />
        </form>
        <div class="flex flex-col gap-2 mt-4">
          <button class="btn-primary" @click="selectOption('Option 1')">
            Option 1 (Correct)
          </button>
          <button class="btn-primary" @click="selectOption('Option 2')">
            Option 2
          </button>
          <button class="btn-primary" @click="selectOption('Option 3')">
            Option 3
          </button>
          <button class="btn-primary" @click="selectOption('Option 4')">
            Option 4
          </button>
          <button class="btn-primary" @click="selectOption('Option 5')">
            Option 5
          </button>
        </div>
      </div>

      <div v-else-if="currentPage === 2">
        <!-- Input Form and Options for Page 2 -->
        <form class="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Your selected option will appear here"
            class="border border-gray-300 p-2"
            readonly
            :value="selectedOption"
          />
        </form>
        <div class="flex flex-col gap-2 mt-4">
          <button class="btn-primary" @click="selectOption('Option 1')">
            Option 1 (Correct)
          </button>
          <button class="btn-primary" @click="selectOption('Option 2')">
            Option 2
          </button>
          <button class="btn-primary" @click="selectOption('Option 3')">
            Option 3
          </button>
          <button class="btn-primary" @click="selectOption('Option 4')">
            Option 4
          </button>
          <button class="btn-primary" @click="selectOption('Option 5')">
            Option 5
          </button>
        </div>
      </div>

      <div v-else-if="currentPage === 3">
        <!-- Content for Page 3 -->
        <p>Page 3 content goes here.</p>
      </div>

      <!-- Navigation Buttons -->
      <form class="flex flex-col mt-5 space-y-4">
        <button class="btn-primary py-[10px]" @click.prevent="handleDisplay">
          Back to Seed Phrase
        </button>
        <!-- <button
          v-if="currentPage === 1"
          class="btn-primary py-[10px]"
          @click.prevent="goToNextPage"
        >
          Pagination Check
        </button>
        <button
          v-if="currentPage > 1"
          class="btn-primary py-[10px]"
          @click.prevent="goToPreviousPage"
        >
          Previous Page
        </button> -->
      </form>

      <img
        :src="getImage('secured-by-arcana.svg')"
        class="h-3 select-none mt-5"
      />
    </div>
  </div>
</template>
