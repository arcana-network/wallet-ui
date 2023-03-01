<script lang="ts" setup>
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
  TransitionRoot,
} from '@headlessui/vue'
import { ref } from 'vue'

const questions: string[] = [
  'What is your q1?',
  'What is your q2?',
  'What is your q3?',
  'What is your q4?',
]

const emit = defineEmits(['change'])

const selectedQuestion = ref('')
const isFocused = ref(false)
</script>

<template>
  <Listbox v-slot="{ open }" v-model="selectedQuestion" nullable>
    <div class="relative">
      <div
        class="relative w-full cursor-default overflow-hidden flex flex-nowrap rounded-[10px] input outline-none items-center"
        :class="{
          'outline-black dark:outline-white outline-1 outline': isFocused,
        }"
      >
        <ListboxButton
          class="h-auto flex flex-nowrap items-center justify-between flex-1 p-4"
        >
          <span
            v-if="selectedQuestion"
            class="flex-1 border-none pr-3 text-base leading-5 bg-transparent text-left text-black dark:text-white truncate outline-none z-[1]"
            >{{ selectedQuestion }}</span
          >
          <span
            v-else
            class="flex-1 border-none pr-3 text-base leading-5 bg-transparent text-left truncate outline-none z-[1] label"
            >Select a question</span
          >
          <img
            src="@/assets/images/arrow-gray.svg"
            class="transition-all will-change-transform delay-300 items-center"
            :class="{ '-rotate-180': open }"
          />
        </ListboxButton>
      </div>
      <TransitionRoot
        leave="transition ease-in duration-100"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div v-show="open">
          <ListboxOptions
            class="absolute max-h-60 w-full p-2 debossed-card text-base focus:outline-black dark:focus:outline-white overflow-auto rounded-t-none rounded-r-none z-10"
            static
          >
            <ListboxOption
              v-for="question in questions"
              :key="question"
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
                  class="block truncate max-w-[60%]"
                  :class="{ 'font-medium': selected, 'font-normal': !selected }"
                >
                  {{ question }}
                </span>
              </li>
            </ListboxOption>
          </ListboxOptions>
        </div>
      </TransitionRoot>
    </div>
  </Listbox>
</template>
