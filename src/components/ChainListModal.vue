<script setup lang="ts">
import { ref, watch } from 'vue'
import { useToast } from 'vue-toastification'

import AddNetwork from '@/components/AddNetwork.vue'
import { getChainLogoUrl } from '@/services/chainlist.service'
import { useRpcStore } from '@/store/rpc'
import {
  setRequestHandler,
  getRequestHandler,
} from '@/utils/requestHandlerSingleton'

const emit = defineEmits(['close'])
const toast = useToast()
const rpcStore = useRpcStore()

const selectedRPCConfig = ref(rpcStore.selectedRPCConfig)
const showAddNetworkModal = ref(false)

watch(
  () => selectedRPCConfig.value,
  () => {
    if (selectedRPCConfig.value) {
      rpcStore.setSelectedRPCConfig(selectedRPCConfig.value)
      const requestHandler = getRequestHandler()
      requestHandler.setRpcConfig(selectedRPCConfig.value)
    }
    emit('close')
  }
)
</script>

<template>
  <AddNetwork v-if="showAddNetworkModal" @close="showAddNetworkModal = false" />
  <div v-else class="flex flex-col gap-5">
    <div class="flex items-center justify-center">
      <p class="text-xl font-bold">Choose Network</p>
    </div>
    <div class="flex flex-col gap-4">
      <div
        v-for="chain in rpcStore.rpcConfigs"
        :key="chain.chainId"
        class="flex items-center gap-2"
      >
        <input
          :id="chain.chainId"
          v-model="selectedRPCConfig"
          type="radio"
          :value="chain"
          name="chain"
          class="radio"
        />
        <label class="flex items-center gap-2" :for="chain.chainId">
          <img
            :src="getChainLogoUrl(Number(chain.chainId))"
            onerror="this.src = '/chain-logos/blockchain-icon.png'"
            class="w-xl h-xl"
          />
          <span class="text-base">{{ chain.chainName }}</span>
          <span v-if="chain.chainType === 'testnet'" class="testnet-tag">
            Testnet
          </span>
        </label>
      </div>
      <button
        class="btn-primary uppercase font-bold text-base py-2 mt-4"
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
