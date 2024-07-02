<script setup lang="ts">
import { ComputedRef, computed } from 'vue'

import VJsonViewer from '@/components/VJsonViewer.vue'
import { getChainLogoUrl } from '@/services/chainlist.service'
import { useRpcStore } from '@/store/rpc'
import { getImage } from '@/utils/getImage'
import { truncateMid } from '@/utils/stringUtils'

const props = defineProps<{
  requestParams: string[]
}>()

const typedData = computed(() => {
  try {
    return JSON.parse(props.requestParams[1])
  } catch (e) {
    return {}
  }
}) as ComputedRef<{
  domain: {
    chainId: number
    name: string
    verifyingContract: string
    version: string
  }
  message: Record<string, unknown>
  primaryType: string
  types: Record<string, unknown>
}>

const rpcStore = useRpcStore()

function handleFallbackLogo(event) {
  event.target.src = getImage('blockchain-icon.png')
}
</script>

<template>
  <div class="card flex flex-1 flex-col gap-4">
    <div
      class="flex flex-col gap-2 text-sm bg-gray-zinc-85 dark:bg-black-arsenic p-4 rounded-xl"
    >
      <div class="flex justify-between items-center gap-4">
        <div class="flex-1 flex flex-col gap-2">
          <div class="flex justify-between items-center gap-1">
            <span
              class="uppercase text-xs font-medium text-gray-myst dark:text-gray-spanish-light"
              >Chain</span
            >
            <div class="flex items-center gap-1">
              <img
                :src="getChainLogoUrl(rpcStore.selectedRPCConfig, 'EVM')"
                class="h-4 w-4"
                @error="handleFallbackLogo"
              />
              <span class="text-base font-medium">
                {{ rpcStore.selectedRPCConfig?.chainName }}
              </span>
            </div>
          </div>
          <div class="flex justify-between items-center gap-1">
            <span
              class="uppercase text-xs font-medium text-gray-myst dark:text-gray-spanish-light"
              >Interact Contract</span
            >
            <span
              :title="typedData.domain.verifyingContract"
              class="text-base font-medium"
            >
              {{ truncateMid(typedData.domain.verifyingContract) }}
            </span>
          </div>
          <div class="flex justify-between items-center gap-1">
            <span
              class="uppercase text-xs font-medium text-gray-myst dark:text-gray-spanish-light"
              >Operation</span
            >
            <span class="text-base font-medium">
              {{ typedData.primaryType }}
            </span>
          </div>
          <div class="flex flex-col gap-1">
            <span
              class="uppercase text-xs font-medium text-gray-myst dark:text-gray-spanish-light"
              >Data</span
            >
            <div
              class="card dark:bg-black-100 h-full p-2 break-word rounded-md overflow-hidden break-words"
            >
              <div class="overflow-auto h-full w-full">
                <VJsonViewer :value="typedData.message"></VJsonViewer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
