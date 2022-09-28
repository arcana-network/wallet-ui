<script setup lang="ts">
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue'
import { ref, watch } from 'vue'

import { useRpcStore } from '@/store/rpc'
import { useImage } from '@/utils/useImage'

const emits = defineEmits(['addNetwork', 'editNetwork'])
const rpcStore = useRpcStore()
const getImage = useImage()

const selectedChain = ref(rpcStore.selectedRpcConfig)

watch(selectedChain, () => {
  rpcStore.setSelectedChainId(selectedChain.value.chainId)
})
</script>

<template>
  <Listbox v-slot="{ open }" v-model="selectedChain">
    <ListboxButton
      class="flex justify-between items-center text-base sm:text-[12px] text-left rounded-lg p-3 sm:p-1 bg-gradient w-full h-14 sm:h-8 outline-none border-none"
    >
      <div class="flex space-x-1 items-center">
        <img
          :src="getImage(selectedChain.favicon)"
          :alt="selectedChain.chainName"
          class="w-3 h-3"
        />
        <p>{{ selectedChain.chainName }}</p>
      </div>
      <img
        :src="getImage('arrow-icon')"
        alt="drop down"
        class="transition-transform"
        :class="{ 'rotate-180': open }"
      />
    </ListboxButton>

    <div
      v-if="open"
      class="bg-gradient p-3 sm:p-1 h-[250px] overflow-auto divide-y-2"
    >
      <div class="flex justify-end pb-2">
        <button
          class="flex items-center space-x-1 h-auto"
          @click="emits('addNetwork')"
        >
          <img :src="getImage('plus-circle-icon')" alt="add network" />
          <span>Network</span>
        </button>
      </div>
      <ListboxOptions
        class="text-base sm:text-[12px] space-y-3 sm:space-y-2 rounded-b-lg pt-2"
      >
        <ListboxOption
          v-for="chain in rpcStore.rpcConfigList"
          :key="chain.chainName"
          :value="chain"
          class="cursor-pointer"
          :class="{ 'text-gray-500': selectedChain.chainId !== chain.chainId }"
        >
          <div class="flex justify-between">
            <div class="flex space-x-1 items-center">
              <img
                :src="getImage(chain.favicon)"
                :alt="chain.chainName"
                class="w-3 h-3"
              />
              <p>{{ chain.chainName }}</p>
            </div>
            <button
              class="h-auto"
              @click.prevent="emits('editNetwork', chain.chainId)"
            >
              <img
                :src="getImage('edit-icon')"
                alt="edit network"
                class="w-4"
              />
            </button>
          </div>
        </ListboxOption>
      </ListboxOptions>
    </div>
  </Listbox>
</template>
