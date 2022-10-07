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

import type { EthAssetContract } from '@/models/Asset'

type SearchAssetProps = {
  tokens: EthAssetContract[]
}

const props = defineProps<SearchAssetProps>()
const emit = defineEmits(['change'])
const ethTokens = [...props.tokens].sort((token1, token2) => {
  if (token1.symbol > token2.symbol) {
    return 1
  }
  if (token2.symbol > token1.symbol) {
    return -1
  }
  return 0
})

const selectedToken = ref('')
const query = ref('')
const isFocused = ref(false)

const filteredTokens = computed(() => {
  if (query.value === '') {
    return [...ethTokens]
  } else {
    return ethTokens.filter((token) => {
      if (token.symbol.toLowerCase().startsWith(query.value.toLowerCase())) {
        return token
      }
      if (token.name?.toLowerCase().startsWith(query.value.toLowerCase())) {
        return token
      }
    })
  }
})

function displayValue() {
  return (tokenSymbol: unknown) => {
    const tokenContract = filteredTokens.value.find(
      (token) => token.symbol === (tokenSymbol as string)
    )
    emit('change', tokenContract)
    return tokenSymbol as string
  }
}
</script>

<template>
  <Combobox v-slot="{ open }" v-model="selectedToken" nullable>
    <div class="relative">
      <div
        class="relative w-full cursor-default overflow-hidden flex flex-nowrap rounded-[10px] input p-4 outline-none"
        :class="{
          'outline-black dark:outline-white outline-1 outline': isFocused,
        }"
      >
        <img src="@/assets/images/search-icon.svg" />
        <ComboboxInput
          class="flex-1 border-none px-3 text-base leading-5 bg-transparent text-left justify-between text-black dark:text-white truncate outline-none"
          placeholder="Enter Token Name or Symbol"
          :display-value="displayValue()"
          @change="query = $event.target.value"
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
        <div v-show="open">
          <ComboboxOptions
            class="absolute max-h-60 w-full debossed-card text-base focus:outline-black dark:focus:outline-white overflow-auto"
            static
          >
            <ComboboxOption
              v-for="token in filteredTokens"
              :key="token.symbol"
              v-slot="{ selected, active }"
              as="template"
              :value="token.symbol"
            >
              <li
                class="relative cursor-default select-none p-4 rounded-[10px] flex justify-between hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white"
                :class="{
                  'bg-zinc-200 dark:bg-zinc-800': active,
                }"
              >
                <span
                  class="block truncate max-w-[60%]"
                  :class="{ 'font-medium': selected, 'font-normal': !selected }"
                >
                  {{ token.name }}
                </span>
                <span
                  :class="{ 'font-medium': selected, 'font-normal': !selected }"
                >
                  {{ token.symbol }}
                </span>
              </li>
            </ComboboxOption>
          </ComboboxOptions>
        </div>
      </TransitionRoot>
    </div>
  </Combobox>
</template>
