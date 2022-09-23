<script lang="ts" setup>
import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
  TransitionRoot,
} from '@headlessui/vue'
import { ref, computed, watch } from 'vue'

import type { EthAssetContract } from '@/models/Asset'
import getImageAsset from '@/utils/getImageAsset'

type SearchAssetProps = {
  tokens: EthAssetContract[]
}

const props = defineProps<SearchAssetProps>()
const emit = defineEmits(['change'])
const symbols = [...props.tokens.map((token) => token.symbol)].sort()

let selected = ref('')
let query = ref('')

const filteredTokens = computed(() => {
  console.log({ queryVal: query.value })
  if (query.value === '') {
    console.log('Query is empty')
    return symbols
  } else {
    console.log('Query is not empty')
    // debugger
    const filteredList: string[] = []
    let i = 0
    for (let symbol of symbols) {
      console.log(++i)
      if (symbol.toLowerCase().startsWith(query.value.toLowerCase())) {
        console.log(symbol, filteredList.length)
        filteredList.push(symbol)
      }
    }
    console.log('Filter', { filteredList })
    return filteredList
  }
})

watch(
  () => filteredTokens.value,
  () => console.log(filteredTokens.value)
)

function handleChange(e) {
  query.value = e.target.value
  console.log(e.target.value)
  emit('change', e.target.value)
}
</script>

<template>
  <Combobox v-model="selected" nullable>
    <div class="relative mt-1">
      <div
        class="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm"
      >
        <ComboboxInput
          class="w-full border-none p-4 text-sm leading-5 text-gray-900 focus:ring-0"
          placeholder="Enter Token Symbol"
          :display-value="(symbol) => symbol as string"
          @change="query = $event.target.value"
        />
        <ComboboxButton
          class="absolute inset-y-0 right-0 flex items-center pr-2"
        >
        </ComboboxButton>
      </div>
      <!-- <TransitionRoot leave="transition ease-in duration-100" leave-from="opacity-100" leave-to="opacity-0"> -->
      <ComboboxOptions
        class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
      >
        <ComboboxOption
          v-for="symbol in filteredTokens"
          :key="symbol"
          v-slot="{ selected, active }"
          as="template"
          :value="symbol"
        >
          <li
            class="relative cursor-default select-none p-4"
            :class="{
              'bg-teal-600 text-white': active,
              'text-gray-900': !active,
            }"
          >
            <!-- <img :src="getImageAsset(`token-logos/${token.logo}`)" /> -->
            <span
              class="block truncate"
              :class="{ 'font-medium': selected, 'font-normal': !selected }"
            >
              {{ symbol }}
            </span>
            <!-- <span :class="{ 'font-medium': selected, 'font-normal': !selected }">
                  {{ token.symbol }}
                </span> -->
          </li>
        </ComboboxOption>
      </ComboboxOptions>
      <!-- </TransitionRoot> -->
    </div>
  </Combobox>
</template>
