<script setup lang="ts">
import Decimal from 'decimal.js'
import { computed } from 'vue'

import { getChainLogoUrl } from '@/services/chainlist.service'
import { useAppStore } from '@/store/app'
import { useRpcStore } from '@/store/rpc'
import { ChainType } from '@/utils/chainType'
import { getImage } from '@/utils/getImage'

const props = defineProps({
  params: {
    type: Object,
    required: true,
  },
})

const rpcStore = useRpcStore()
const appStore = useAppStore()

const chainId = computed(() => new Decimal(props.params.chainId).toString())

const chain = computed(() =>
  rpcStore.rpcConfigList.find(
    (chain) => Number(chain.chainId) === Number(props.params.chainId)
  )
)

function handleFallbackLogo(event) {
  event.target.src = getImage('blockchain-icon.png')
}
</script>

<template>
  <div class="flex flex-col gap-2 text-sm">
    <div class="text-sm font-medium">Chain Details</div>
    <div v-if="chainId" class="flex justify-between gap-4">
      <span class="w-[120px]">Chain Id</span>
      <span
        class="w-[200px] text-right whitespace-nowrap overflow-hidden text-ellipsis"
        :title="chainId"
      >
        {{ chainId }}
      </span>
    </div>
    <div v-if="chain?.chainName" class="flex justify-between gap-4">
      <span class="w-[120px]">Name</span>
      <span
        class="w-[200px] text-right flex gap-1 items-center justify-end"
        :title="chain.chainName"
      >
        <img
          :src="
            getChainLogoUrl(
              chain,
              appStore.chainType === ChainType.evm_secp256k1 ? 'EVM' : 'solana'
            )
          "
          class="h-4 w-4"
          @error="handleFallbackLogo"
        />
        <span class="whitespace-nowrap overflow-hidden text-ellipsis">{{
          chain.chainName
        }}</span>
      </span>
    </div>
    <div
      v-if="chain?.nativeCurrency?.symbol"
      class="flex justify-between gap-4"
    >
      <span class="w-[120px]">Currency</span>
      <span
        class="w-[200px] text-right whitespace-nowrap overflow-hidden text-ellipsis"
        :title="chain.nativeCurrency.symbol"
        >{{ chain.nativeCurrency.symbol }}</span
      >
    </div>
    <div v-if="chain?.rpcUrls?.length" class="flex justify-between gap-4">
      <span class="w-[120px]">RPC</span>
      <span
        class="w-[200px] text-right whitespace-nowrap overflow-hidden text-ellipsis"
        :title="chain.rpcUrls.join(', ')"
        >{{ chain.rpcUrls[0] }}</span
      >
    </div>
  </div>
</template>
