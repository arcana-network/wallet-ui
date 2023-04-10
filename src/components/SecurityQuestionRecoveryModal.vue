<script setup lang="ts">
import { computed, ref, onBeforeMount, type Ref } from 'vue'
import { useToast } from 'vue-toastification'

import SelectQuestion from '@/components/SelectQuestion.vue'

const emit = defineEmits(['proceed', 'back'])
const props = defineProps<{
  questions: {
    index: string
    kind: 'global' | 'custom'
    question?: string
  }[]
}>()
const toast = useToast()

const answers: Ref<
  {
    index: string
    answer: string
  }[]
> = ref([])

const selectedQuestions = computed(() => {
  return props.questions.reduce((obj, arr) => {
    obj[arr.index] = arr.question
    return obj
  }, {})
})

onBeforeMount(() => {
  answers.value = props.questions
    .slice(0, 3)
    .map((question) => ({ index: question.index, answer: '' }))
})

function getSelectedQuestion(question: any) {
  return [question.index, question.question]
}

function handleQuestionChange(index: number, ev: any) {
  answers.value[index].index = ev[0]
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
  <div class="px-1 py-2 overflow-y-auto">
    <div class="flex gap-2 items-center mb-5">
      <button @click.stop="emit('back')">
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
          <label>Question {{ n }}</label>
          <SelectQuestion
            :questions="selectedQuestions"
            :selected-question="getSelectedQuestion(props.questions[n - 1])"
            @change="handleQuestionChange(n - 1, $event)"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label>Answer {{ n }}</label>
          <input
            v-model.trim="answers[n - 1].answer"
            class="text-base p-4 input text-ellipsis overflow-hidden whitespace-nowrap"
          />
        </div>
      </div>
      <div class="flex flex-col gap-4">
        <button
          class="mt-4 text-sm sm:text-xs rounded-xl font-semibold text-white dark:bg-white bg-black dark:text-black w-full h-10 sm:h-8 uppercase"
          type="submit"
        >
          Proceed
        </button>
        <div class="flex justify-center">
          <button
            class="text-sm sm:text-xs font-semibold text-white dark:bg-white bg-black dark:text-black w-full h-10 sm:h-8 uppercase"
            @click.stop="emit('back')"
          >
            Back
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<style scoped>
.modal-title {
  font-size: var(--fs-500);
}

.modal-description {
  font-size: var(--fs-250);
  color: var(--fg-color-secondary);
}

label {
  padding-left: 5px;
  font-size: var(--fs-300);
  font-weight: 600;
  color: var(--fg-color-secondary);
}
</style>
