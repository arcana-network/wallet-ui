<script setup lang="ts">
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue'
import { ref, watch } from 'vue'

import { useRpcStore } from '@/store/rpc'
import { getRequestHandler } from '@/utils/requestHandlerSingleton'
import { useImage } from '@/utils/useImage'

const emits = defineEmits(['addNetwork', 'editNetwork'])
const rpcStore = useRpcStore()
const getImage = useImage()

const selectedChain = ref(rpcStore.selectedRpcConfig)

async function setChain() {
  const { chainId, ...rpcConfig } = rpcStore.selectedRpcConfig

  const selectedChainId = Number(chainId)
  await getRequestHandler().setRpcConfig({
    ...rpcConfig,
    chainId: selectedChainId,
  })
}
watch(selectedChain, async () => {
  rpcStore.setSelectedChainId(selectedChain.value.chainId)
  await setChain()
})
</script>

<template>
  <Listbox v-slot="{ open }" v-model="selectedChain">
    <ListboxButton
      class="flex justify-between items-center text-base sm:text-[12px] text-left rounded-lg p-3 sm:p-1 debossed-card w-full h-14 sm:h-8 outline-none border-none"
      :class="{
        'outline-black dark:outline-white outline-1 outline': open,
      }"
    >
      <div v-if="selectedChain" class="flex space-x-1 items-center">
        <img
          :src="getImage(selectedChain.favicon)"
          :alt="selectedChain.chainName"
          class="w-6 h-6"
        />
        <p class="overflow-hidden whitespace-nowrap text-ellipsis max-w-[16ch]">
          {{ selectedChain.chainName }}
        </p>
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
      class="debossed-card p-3 sm:p-1 h-48 rounded-[10px] -mt-2 divide-y-[1px] divide-gray-600 flex flex-col"
    >
      <ListboxOptions
        class="text-base sm:text-[12px] space-y-3 sm:space-y-2 rounded-b-lg py-2 flex-1 overflow-auto"
      >
        <ListboxOption
          v-for="chain in rpcStore.rpcConfigList"
          :key="chain.chainName"
          :value="chain"
          class="cursor-pointer hover:text-black dark:hover:text-white"
          :class="{ 'text-gray-500': selectedChain.chainId !== chain.chainId }"
        >
          <div class="flex justify-between">
            <div class="flex space-x-1 items-center">
              <img
                :src="getImage(chain.favicon)"
                :alt="chain.chainName"
                class="w-6 h-6"
              />
              <p
                class="overflow-hidden whitespace-nowrap text-ellipsis max-w-[20ch]"
              >
                {{ chain.chainName }}
              </p>
            </div>
            <button
              v-if="chain.isCustom"
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
      <div class="flex justify-center pt-2">
        <button
          class="flex items-center space-x-1 h-auto"
          @click="emits('addNetwork')"
        >
          <span class="text-xl">+</span>
          <span>New</span>
        </button>
      </div>
    </div>
  </Listbox>
</template>
