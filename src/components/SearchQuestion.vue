<script lang="ts" setup>
import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
  TransitionRoot,
} from '@headlessui/vue'
import { ref, computed, onMounted } from 'vue'

import { useAppStore } from '@/store/app'
import { getFontFaimly, getFontSizeStyle } from '@/utils/utilsFunction'

type SearchQuestionProps = {
  questions: {
    [key: number]: string
  }
  value?: string
}

const props = defineProps<SearchQuestionProps>()

const emit = defineEmits(['change'])
const appStore = useAppStore()
const selectedQuestion = ref('')
const isFocused = ref(false)
const query = ref('')

const questions = computed(() => {
  return Object.entries(props.questions)
})

const filteredQuestions = computed(() => {
  if (query.value === '') {
    return [...questions.value]
  } else {
    return questions.value.filter((question) => {
      if (
        question[1].question.toLowerCase().includes(query.value.toLowerCase())
      ) {
        return question
      }
    })
  }
})

onMounted(() => {
  if (props.value) {
    selectedQuestion.value = props.value
  }
})

function handleChange(ev) {
  query.value = ev.target.value
  selectedQuestion.value = ev.target.value
}

function displayValue() {
  return (question: unknown) => {
    if (typeof question === 'string') {
      emit('change', [-1, question])
      return question
    }
    emit('change', question)
    return question?.[1].question as string
  }
}
</script>

<template>
  <Combobox v-slot="{ open }" v-model="selectedQuestion" nullable>
    <div class="relative">
      <div
        class="dark:bg-black-arsenic bg-gray-zinc-85 relative w-full cursor-default overflow-hidden flex flex-nowrap input-field p-1 pr-3 focus:input-active"
        :class="{
          'input-active': isFocused,
        }"
      >
        <ComboboxInput
          class="flex-1 border-none text-sm text-left justify-between py-1 px-3 truncate"
          placeholder="Enter or select the question"
          :display-value="displayValue()"
          @change="handleChange"
          @focus="isFocused = true"
          @blur="isFocused = false"
        />
        <ComboboxButton class="h-auto align-middle">
          <img
            src="@/assets/images/arrow-gray.svg"
            class="transition-all will-change-transform delay-300 w-lg h-lg"
            :class="{ '-rotate-180': open }"
          />
        </ComboboxButton>
      </div>
      <TransitionRoot
        leave="transition ease-in duration-100"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div v-show="open && filteredQuestions.length">
          <ComboboxOptions
            class="absolute max-h-48 w-full py-2 px-1 card text-sm overflow-auto rounded-t-none z-10"
            static
          >
            <ComboboxOption
              v-for="question in filteredQuestions"
              :key="question[1]"
              v-slot="{ selected, active }"
              as="template"
              :value="question"
            >
              <li
                class="relative cursor-pointer select-none p-3 rounded-sm flex justify-between hover:bg-gray-200"
                :class="{
                  'bg-gray-200': active,
                }"
              >
                <span
                  class="block truncate"
                  :class="{
                    [getFontSizeStyle(
                      Number(appStore.theme_settings.font_size)
                    )]: true,
                    'font-medium': selected,
                    'font-normal': !selected,
                  }"
                  :style="{
                    fontFamily: getFontFaimly(
                      appStore.theme_settings.font_pairing
                    ).primaryFontClass,
                    color: appStore.theme_settings.font_color,
                  }"
                  :title="question[1]"
                >
                  {{ question[1].question }}
                </span>
              </li>
            </ComboboxOption>
          </ComboboxOptions>
        </div>
      </TransitionRoot>
    </div>
  </Combobox>
</template>
