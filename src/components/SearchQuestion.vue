<script lang="ts" setup>
import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
  TransitionRoot,
} from '@headlessui/vue'
import { ref, computed } from 'vue'

type SearchQuestionProps = {
  questions: {
    [key: number]: string
  }
}

const props = defineProps<SearchQuestionProps>()

const emit = defineEmits(['change'])

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
      if (question[1].toLowerCase().includes(query.value.toLowerCase())) {
        return question
      }
    })
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
    return question?.[1] as string
  }
}
</script>

<template>
  <Combobox v-slot="{ open }" v-model="selectedQuestion" nullable>
    <div class="relative">
      <div
        class="relative w-full cursor-default overflow-hidden flex flex-nowrap rounded-[10px] input p-4 outline-none"
        :class="{
          'outline-black dark:outline-white outline-1 outline': isFocused,
        }"
      >
        <ComboboxInput
          class="flex-1 border-none text-base leading-5 bg-transparent text-left justify-between text-black dark:text-white truncate outline-none"
          placeholder="Enter or select the question"
          :display-value="displayValue()"
          @change="handleChange"
          @focus="isFocused = true"
          @blur="isFocused = false"
        />
        <ComboboxButton class="h-auto align-middle">
          <img
            src="@/assets/images/arrow-gray.svg"
            class="transition-all will-change-transform delay-300"
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
            class="absolute max-h-60 w-full p-2 debossed-card text-base focus:outline-black dark:focus:outline-white overflow-auto rounded-t-none rounded-r-none z-10"
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
                class="relative cursor-pointer select-none p-4 rounded-[10px] flex justify-between hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white"
                :class="{
                  'bg-zinc-200 dark:bg-zinc-800': active,
                }"
              >
                <span
                  class="block truncate"
                  :class="{ 'font-medium': selected, 'font-normal': !selected }"
                  :title="question[1]"
                >
                  {{ question[1] }}
                </span>
              </li>
            </ComboboxOption>
          </ComboboxOptions>
        </div>
      </TransitionRoot>
    </div>
  </Combobox>
</template>
