<script setup lang="ts">
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue'
import { onMounted, ref, watch } from 'vue'

import { useRpcStore } from '@/store/rpc'
import { getChainList } from '@/utils/chainList'
import { useImage } from '@/utils/useImage'

const emits = defineEmits(['addNetwork'])

const rpcStore = useRpcStore()
const getImage = useImage()

onMounted(() => {
  if (!rpcStore.chainList.length) {
    rpcStore.setChainList(getChainList())
  }
})

const chainFromParentApp = rpcStore.chainList.find((chain) => {
  return (
    rpcStore.rpcConfig?.chainId === chain.chainId &&
    rpcStore.rpcConfig?.chainName === chain.chainName
  )
})

const selectedChain = ref(chainFromParentApp || rpcStore.chainList[0])

watch(selectedChain, () => {
  rpcStore.setRpcConfig(selectedChain.value)
})

rpcStore.$onAction(({ name, store, args }) => {
  if (name === 'addNetwork') {
    store.setRpcConfig(args[0])
  }
})
</script>

<template>
  <Listbox v-slot="{ open }" v-model="selectedChain">
    <ListboxButton
      class="flex justify-between items-center text-base sm:text-[12px] text-left rounded-lg p-3 sm:p-1 bg-gradient w-full h-14 sm:h-8 outline-none border-none"
    >
      <div class="flex space-x-1 items-center">
        <img
          :src="selectedChain.favicon"
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
        class="text-base sm:text-[12px] space-y-4 sm:space-y-2 rounded-b-lg pt-2"
      >
        <ListboxOption
          v-for="chain in rpcStore.chainList"
          :key="chain.chainName"
          :value="chain"
          class="cursor-pointer"
          :class="{ 'text-gray-500': selectedChain.chainId !== chain.chainId }"
        >
          <div class="flex space-x-1 items-center">
            <img :src="chain.favicon" :alt="chain.chainName" class="w-3 h-3" />
            <p>{{ chain.chainName }}</p>
          </div>
        </ListboxOption>
      </ListboxOptions>
    </div>
  </Listbox>
</template>
