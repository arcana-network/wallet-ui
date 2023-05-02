<script lang="ts" setup>
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue'
import { ref, computed, onMounted } from 'vue'

type SearchQuestionProps = {
  questions: {
    [key: number | string]: string
  }
  selectedQuestion: string[]
}

const props = defineProps<SearchQuestionProps>()

const emit = defineEmits(['change'])

const selectedQuestionRef = ref(['', ''])

onMounted(() => {
  selectedQuestionRef.value = props.selectedQuestion
})

const questions = computed(() => {
  return Object.entries(props.questions)
})

function handleChange(question: string[]) {
  emit('change', question)
}
</script>

<template>
  <Listbox v-model="selectedQuestionRef" @update:model-value="handleChange">
    <div
      class="relative w-full cursor-default flex flex-nowrap rounded-[10px] input p-4 outline-none"
    >
      <ListboxButton
        class="flex flex-1 border-none text-base leading-5 bg-transparent text-left justify-between text-black dark:text-white truncate outline-none h-auto"
      >
        {{ selectedQuestionRef?.[1] }}
        <img
          src="@/assets/images/arrow-gray.svg"
          class="transition-all will-change-transform delay-300"
        />
      </ListboxButton>
      <ListboxOptions
        class="absolute top-full left-0 max-h-60 w-full p-2 debossed-card text-base focus:outline-black dark:focus:outline-white overflow-auto rounded-t-none rounded-r-none z-10"
      >
        <ListboxOption
          v-for="question in questions"
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
        </ListboxOption>
      </ListboxOptions>
    </div>
  </Listbox>
</template>
