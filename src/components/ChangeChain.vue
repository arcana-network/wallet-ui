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

const rpcStore = useRpcStore()
const getImage = useImage()

const ChainList = [
  {
    chainId: 1,
    rpcUrls: ['https://cloudflare-eth.com/'],
    chainName: 'Ethereum Mainnet',
    blockExplorerUrls: ['https://etherscan.io/'],
    favicon: getImage('ethereum-icon'),
    nativeCurrency: {
      symbol: 'ETH',
      decimals: 18,
    },
  },
  {
    chainId: 3,
    rpcUrls: ['https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
    chainName: 'Ethereum Ropsten (Testnet)',
    blockExplorerUrls: ['https://ropsten.etherscan.io/'],
    favicon: getImage('ethereum-icon'),
    nativeCurrency: {
      symbol: 'ETH',
      decimals: 18,
    },
  },
  {
    chainId: 4,
    rpcUrls: ['https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
    chainName: 'Ethereum Rinkeby (Testnet)',
    blockExplorerUrls: ['https://rinkeby.etherscan.io/'],
    favicon: getImage('ethereum-icon'),
    nativeCurrency: {
      symbol: 'ETH',
      decimals: 18,
    },
  },
  {
    chainId: 5,
    rpcUrls: ['https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
    chainName: 'Ethereum Goerli (Testnet)',
    blockExplorerUrls: ['https://goerli.etherscan.io/'],
    favicon: getImage('ethereum-icon'),
    nativeCurrency: {
      symbol: 'ETH',
      decimals: 18,
    },
  },
  {
    chainId: 137,
    rpcUrls: ['https://polygon-rpc.com'],
    chainName: 'Polygon Mainnet',
    blockExplorerUrls: ['https://polygonscan.com'],
    favicon: getImage('polygon-icon'),
    nativeCurrency: {
      symbol: 'matic',
      decimals: 18,
    },
  },
  {
    chainId: 80001,
    rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
    chainName: 'Polygon Mumbai (Testnet)',
    blockExplorerUrls: ['https://mumbai-explorer.matic.today'],
    favicon: getImage('polygon-icon'),
    nativeCurrency: {
      symbol: 'matic',
      decimals: 18,
    },
  },
  {
    chainId: 40405,
    rpcUrls: ['https://blockchain001-testnet.arcana.network/'],
    chainName: 'Arcana (Testnet)',
    blockExplorerUrls: ['https://explorer.beta.arcana.network/'],
    favicon: getImage('arcana-icon'),
  },
  {
    chainId: 40404,
    rpcUrls: ['https://blockchain-dev.arcana.network'],
    chainName: 'Arcana Dev',
    blockExplorerUrls: ['https://explorer.dev.arcana.network/'],
    favicon: getImage('arcana-icon'),
  },
]

const chainFromParentApp = ChainList.find((chain) => {
  return rpcStore.rpcConfig?.chainId === chain.chainId
})

const selectedChain = ref(chainFromParentApp || ChainList[0])

watch(selectedChain, () => {
  rpcStore.setRpcConfig(selectedChain.value)
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

    <ListboxOptions
      class="text-base sm:text-[12px] bg-gradient p-3 sm:p-1 space-y-4 sm:space-y-2 overflow-auto h-[250px] rounded-b-lg"
    >
      <ListboxOption
        v-for="chain in ChainList"
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
  </Listbox>
</template>
