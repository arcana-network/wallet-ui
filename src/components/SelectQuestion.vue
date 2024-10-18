<script lang="ts" setup>
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue'
import { ref, computed, onMounted } from 'vue'

import { useAppStore } from '@/store/app'
import { getFontFaimly, getFontSizeStyle } from '@/utils/utilsFunction'

type SearchQuestionProps = {
  questions: {
    [key: number | string]: string
  }
  selectedQuestion: string[]
}

const props = defineProps<SearchQuestionProps>()

const emit = defineEmits(['change'])

const selectedQuestionRef = ref(['', ''])
const appStore = useAppStore()

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
      class="dark:bg-black-arsenic bg-gray-zinc-85 relative w-full cursor-default flex flex-nowrap rounded-sm input-field p-2 outline-none"
    >
      <ListboxButton
        class="flex flex-1 border-none text-sm bg-transparent text-left justify-between items-center truncate outline-none h-auto"
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
      >
        {{ selectedQuestionRef?.[1] }}
        <img
          src="@/assets/images/arrow-gray.svg"
          class="transition-all will-change-transform delay-300 w-lg h-lg"
        />
      </ListboxButton>
      <ListboxOptions
        class="dark:bg-black-arsenic bg-gray-zinc-85 absolute top-full left-0 max-h-60 w-full py-2 px-1 card text-sm focus:outline-black-100 dark:focus:outline-white-100 overflow-auto rounded-t-none z-10"
      >
        <ListboxOption
          v-for="question in questions"
          :key="question[1]"
          v-slot="{ selected, active }"
          as="template"
          :value="question"
        >
          <li
            class="relative cursor-pointer select-none py-2 px-3 rounded-sm flex justify-between items-center hover:bg-gray-200"
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
              :title="question[1]"
              :style="{
                fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                  .primaryFontClass,
                color: appStore.theme_settings.font_color,
              }"
            >
              {{ question[1] }}
            </span>
          </li>
        </ListboxOption>
      </ListboxOptions>
    </div>
  </Listbox>
</template>
