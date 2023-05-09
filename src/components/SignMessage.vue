<script setup lang="ts">
import { storeToRefs } from 'pinia'

import DateTime from '@/components/DateTime.vue'
import SignMessageAdvancedInfo from '@/components/signMessageAdvancedInfo.vue'
import SignMessageCompact from '@/components/SignMessageCompact.vue'
import type { Request } from '@/models/Connection'
import { useAppStore } from '@/store/app'
import { useRpcStore } from '@/store/rpc'
import { advancedInfo } from '@/utils/advancedInfo'
import { methodAndAction } from '@/utils/method'
import { useImage } from '@/utils/useImage'

const appStore = useAppStore()
const rpcStore = useRpcStore()
const getImage = useImage()

const { selectedRpcConfig } = storeToRefs(rpcStore)

defineProps({
  request: {
    type: Request,
    required: true,
  },
})

const emits = defineEmits(['reject', 'approve'])

const stateChangeRequests = [
  methodAndAction.wallet_addEthereumChain,
  methodAndAction.wallet_switchEthereumChain,
  methodAndAction.wallet_watchAsset,
]

function getTitle(requestMethod: string) {
  if (stateChangeRequests.includes(requestMethod)) {
    return requestMethod
  }
  return 'Sign Message'
}
</script>

<template>
  <SignMessageCompact
    v-if="appStore.compactMode"
    :request="request"
    @approve="emits('approve')"
    @reject="emits('reject')"
  />
  <div v-else class="flex flex-1 flex-col space-y-4 sm:space-y-3">
    <div class="flex items-baseline">
      <h1 class="flex-1 m-0 font-semibold text-xl sm:text-sm capitalize">
        {{ getTitle(methodAndAction[request.request.method]) }}
      </h1>
      <DateTime :datetime="request.receivedTime" />
    </div>
    <p class="font-normal text-sm sm:text-xs">
      {{ appStore.name }} requests your permission to perform the following
      action:
    </p>
    <div>
      <p class="text-sm sm:text-xs text-zinc-400 font-semibold">Network</p>
      <p class="text-base sm:text-sm flex gap-2">
        <img
          :src="getImage(rpcStore.selectedRpcConfig.favicon)"
          class="w-6 h-6"
        />
        {{ selectedRpcConfig.chainName }}
      </p>
    </div>
    <p
      class="flex items-center justify-center h-[80px] text-base sm:text-xs font-semibold text-center rounded-[10px] bg-gradient"
    >
      {{ methodAndAction[request.request.method] }}
    </p>
    <SignMessageAdvancedInfo
      :info="advancedInfo(request.request.method, request.request.params)"
    />
  </div>
</template>
