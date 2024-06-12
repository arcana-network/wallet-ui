<script setup lang="ts">
import { ref, watch } from 'vue'

import AddNetwork from '@/components/AddNetwork.vue'
import { getChainLogoUrl } from '@/services/chainlist.service'
import { useAppStore } from '@/store/app'
import { useRpcStore } from '@/store/rpc'
import { ChainType } from '@/utils/chainType'
import { getImage } from '@/utils/getImage'
import {
  getRequestHandler,
  requestHandlerExists,
} from '@/utils/requestHandlerSingleton'

const emit = defineEmits(['close'])
const rpcStore = useRpcStore()

const selectedRPCConfig = ref(rpcStore.selectedRPCConfig)
const showAddNetworkModal = ref(false)
const appStore = useAppStore()

const alphabeticalSort = (field) => (a, b) => a[field].localeCompare(b[field])

const sortedRpcConfigs = rpcStore.rpcConfigList
  ?.sort(alphabeticalSort('chainName'))
  .sort(alphabeticalSort('chainType'))

watch(
  () => selectedRPCConfig.value,
  () => {
    if (selectedRPCConfig.value && requestHandlerExists()) {
      rpcStore.setSelectedRPCConfig(selectedRPCConfig.value)
      const requestHandler = getRequestHandler()
      requestHandler.setRpcConfig(selectedRPCConfig.value)
    }
    emit('close')
  }
)

function handleFallbackLogo(event) {
  event.target.src = getImage('blockchain-icon.png')
}

function getChainType(chainType: ChainType) {
  switch (chainType) {
    case ChainType.evm_secp256k1:
      return 'EVM'
    case ChainType.solana_cv25519:
      return 'solana'
    case ChainType.multiversx_cv25519:
      return 'multiversx'
    case ChainType.near_cv25519:
      return 'near'
  }
}
</script>

<template>
  <AddNetwork v-if="showAddNetworkModal" @close="showAddNetworkModal = false" />
  <div v-else class="flex flex-col gap-5">
    <div class="flex items-center justify-center">
      <p class="font-Nohemi text-[20px] font-semibold">Choose Network</p>
    </div>
    <div class="flex flex-col gap-4">
      <div
        v-for="chain in sortedRpcConfigs"
        :key="chain.chainId"
        class="flex items-center gap-2"
      >
        <input
          :id="String(chain.chainId)"
          v-model="selectedRPCConfig"
          type="radio"
          :value="chain"
          name="chain"
          class="radio"
        />
        <label class="flex items-center gap-2" :for="String(chain.chainId)">
          <img
            :src="getChainLogoUrl(chain, getChainType(appStore.chainType))"
            class="w-xl h-xl"
            @error="handleFallbackLogo"
          />
          <span class="text-base">{{ chain.chainName }}</span>
          <span v-if="chain.chainType === 'testnet'" class="testnet-tag">
            Testnet
          </span>
        </label>
      </div>
      <button
        v-if="appStore.chainType === ChainType.evm_secp256k1"
        class="btn-primary uppercase font-medium text-base py-2 mt-4"
        @click.stop="showAddNetworkModal = true"
      >
        Add network
      </button>
    </div>
  </div>
</template>

<style scoped>
.testnet-tag {
  padding: 1px 2px;
  font-size: 8px;
  color: #fe6827;
  background: #fe682710;
  border-radius: 2px;
  border-radius: 10px;
}
</style>
