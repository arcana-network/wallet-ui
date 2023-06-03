<script setup lang="ts">
import { computed, ref, onBeforeMount, type Ref } from 'vue'
import { useToast } from 'vue-toastification'

import SelectQuestion from '@/components/SelectQuestion.vue'

const emit = defineEmits(['proceed', 'back', 'switch-alternate'])
const props = defineProps<{
  questions: {
    index: string
    kind: 'global' | 'custom'
    question: {
      question: string
      example: string
    }
  }[]
}>()
const toast = useToast()

const answers: Ref<
  {
    index: string
    answer: string
  }[]
> = ref([])
const customPlaceholders: Ref<string[]> = ref([])

const selectedQuestions = computed(() => {
  return props.questions.reduce((obj, arr) => {
    obj[arr.index] = arr.question?.question || arr.question
    return obj
  }, {})
})

onBeforeMount(() => {
  answers.value = props.questions
    .slice(0, 3)
    .map((question) => ({ index: question.index, answer: '' }))
  customPlaceholders.value = props.questions
    .slice(0, 3)
    .map((question) => question.question.example)
})

function getSelectedQuestion(question: any) {
  return [question.index, question.question?.question || question.question]
}

function handleQuestionChange(index: number, ev: any) {
  answers.value[index].index = ev[0]
  customPlaceholders.value[index] =
    props.questions.find((question) => question.index === ev[0])?.question
      .example || 'Enter the answer'
}

function handleProceed() {
  const isAllQuestionsAnswered = answers.value.every(
    (answer) => !!answer.answer?.trim()
  )

  if (!isAllQuestionsAnswered) {
    return toast.error('Answer all the questions to recover key')
  }

  let hasSameQuestions = false

  const answersToEmit = answers.value.reduce((obj, answer) => {
    if (obj[answer.index]) hasSameQuestions = true
    obj[answer.index] = answer.answer
    return obj
  }, {})

  if (hasSameQuestions) {
    return toast.error('Questions must be different')
  }

  emit('proceed', {
    answers: answersToEmit,
  })
}
</script>

<template>
  <div class="px-4 py-2">
    <div class="flex gap-2 items-center mb-5">
      <button title="Click to go back" @click.stop="emit('back')">
        <img
          src="@/assets/images/arrow-white.svg"
          class="-rotate-90 invert dark:invert-0"
        />
      </button>
      <div class="modal-title font-semibold">Security Questions</div>
    </div>
    <form class="flex flex-col gap-6" @submit.prevent="handleProceed">
      <div
        v-for="n in 3"
        :key="`recovery-question-${n}`"
        class="flex flex-col gap-2"
      >
        <div class="flex flex-col gap-1">
          <label class="text-sm text-gray-100">Question {{ n }}</label>
          <SelectQuestion
            :questions="selectedQuestions"
            :selected-question="getSelectedQuestion(props.questions[n - 1])"
            @change="handleQuestionChange(n - 1, $event)"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm text-gray-100">Answer {{ n }}</label>
          <input
            v-model.trim="answers[n - 1].answer"
            :placeholder="customPlaceholders[n - 1]"
            class="text-sm p-2 input-field text-ellipsis overflow-hidden whitespace-nowrap focus:input-active"
          />
        </div>
      </div>
      <div class="flex flex-col mt-1 justify-center items-center gap-4">
        <button
          class="mt-1 text-sm btn-primary p-2 uppercase w-48"
          type="submit"
        >
          Proceed
        </button>
        <button
          class="font-semibold capitalize text-sm btn-tertiary"
          @click.stop="emit('switch-alternate')"
        >
          Enter security PIN Instead
        </button>
      </div>
    </form>
  </div>
</template>
