<script setup lang="ts">
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue'
import { ref, watch } from 'vue'

import { CHAIN_LIST } from '@/models/RpcConfigList'
import { useRpcStore } from '@/store/rpc'
import { useImage } from '@/utils/useImage'

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

    <ListboxOptions
      class="text-base sm:text-[12px] bg-gradient p-3 sm:p-1 space-y-4 sm:space-y-2 overflow-auto h-[250px] rounded-b-lg"
    >
      <ListboxOption
        v-for="chain in CHAIN_LIST"
        :key="chain.chainName"
        :value="chain"
        class="cursor-pointer"
        :class="{ 'text-gray-500': selectedChain.chainId !== chain.chainId }"
      >
        <div class="flex space-x-1 items-center">
          <img
            :src="getImage(chain.favicon)"
            :alt="chain.chainName"
            class="w-3 h-3"
          />
          <p>{{ chain.chainName }}</p>
        </div>
      </ListboxOption>
    </ListboxOptions>
  </Listbox>
</template>
