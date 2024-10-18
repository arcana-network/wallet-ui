<script setup lang="ts">
import { computed, ref, onBeforeMount, type Ref } from 'vue'
import { useToast } from 'vue-toastification'

import SelectQuestion from '@/components/SelectQuestion.vue'
import { useAppStore } from '@/store/app'
import { content, errors } from '@/utils/content'
import { getImage } from '@/utils/getImage'
import { useSVGInjector } from '@/utils/useSvgInjector.ts'
import { getFontFaimly, getFontSizeStyle } from '@/utils/utilsFunction'

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
const appStore = useAppStore()

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
    return toast.error(content.RECOVERY.ANSWER_ALL)
  }

  let hasSameQuestions = false

  const answersToEmit = answers.value.reduce((obj, answer) => {
    if (obj[answer.index]) hasSameQuestions = true
    obj[answer.index] = answer.answer
    return obj
  }, {})

  if (hasSameQuestions) {
    return toast.error(content.RECOVERY.QUESTIONS)
  }

  emit('proceed', {
    answers: answersToEmit,
  })
}

const backContainer = ref<HTMLElement | null>(null)

const svgRefs = [backContainer]

const { fetchAndInjectSVG } = useSVGInjector(svgRefs)
</script>

<template>
  <div class="px-4 py-2">
    <div class="flex gap-2 items-center mb-5">
      <button title="Click to go back" @click.stop="emit('back')">
        <div ref="backContainer">
          <img
            :src="getImage('back-arrow.svg')"
            alt="Back Icon"
            @load="(event) => fetchAndInjectSVG(event, 0)"
          />
        </div>
      </button>
      <div class="modal-title font-medium">Security Questions</div>
    </div>
    <form class="flex flex-col gap-6" @submit.prevent="handleProceed">
      <div
        v-for="n in 3"
        :key="`recovery-question-${n}`"
        class="flex flex-col gap-2"
      >
        <div class="flex flex-col gap-1">
          <label
            :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
            :style="{
              fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                .primaryFontClass,
              color: appStore.theme_settings.font_color,
            }"
            >Question {{ n }}</label
          >
          <SelectQuestion
            :questions="selectedQuestions"
            :selected-question="getSelectedQuestion(props.questions[n - 1])"
            @change="handleQuestionChange(n - 1, $event)"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label
            :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
            :style="{
              fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                .primaryFontClass,
              color: appStore.theme_settings.font_color,
            }"
            >Answer {{ n }}</label
          >
          <input
            v-model.trim="answers[n - 1].answer"
            :placeholder="customPlaceholders[n - 1]"
            class="text-sm p-2 input-field text-ellipsis overflow-hidden whitespace-nowrap focus:input-active bg-gray-zinc dark:bg-black-arsenic"
          />
        </div>
      </div>
      <div class="flex flex-col mt-1 justify-center items-center gap-4">
        <button
          class="mt-1 text-sm btn-primary p-2 w-48"
          type="submit"
          :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
          :style="{
            fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
              .primaryFontClass,
            color: appStore.theme_settings.font_color,
            borderColor: appStore.theme_settings.accent_color,
            backgroundColor: appStore.theme_settings.accent_color,
          }"
        >
          Proceed
        </button>
        <button
          class="font-medium capitalize text-sm btn-tertiary"
          :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
          :style="{
            fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
              .primaryFontClass,
            color: appStore.theme_settings.font_color,
            borderColor: appStore.theme_settings.accent_color,
            backgroundColor: appStore.theme_settings.accent_color,
          }"
          @click.stop="emit('switch-alternate')"
        >
          Enter security PIN Instead
        </button>
      </div>
    </form>
  </div>
</template>
