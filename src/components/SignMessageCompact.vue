<script setup lang="ts">
import DateTime from '@/components/DateTime.vue'
import type { Request } from '@/models/Connection'
import { useAppStore } from '@/store/app'
import { methodAndAction } from '@/utils/method'

defineProps({
  request: {
    type: Request,
    required: true,
  },
})

const emits = defineEmits(['reject', 'approve'])

const appStore = useAppStore()

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

function getPermissionText(method, request) {
  const { params } = request
  const { chainName } = params[0]
  if (method === 'wallet_addEthereumChain') {
    return chainName ? `Adding Chain - ${chainName}` : 'Adding Chain'
  } else if (method === 'wallet_switchEthereumChain') {
    return chainName ? `Switch Chain - ${chainName}` : 'Switch Chain'
  } else {
    return methodAndAction[method]
  }
}
</script>

<template>
  <div class="flex flex-1 flex-col space-y-2 rounded-b-xl">
    <div class="flex items-baseline">
      <h1 class="flex-1 m-0 font-semibold text-base sm:text-sm capitalize">
        {{ getTitle(methodAndAction[request.request.method]) }}
      </h1>
      <DateTime :datetime="request.receivedTime" />
    </div>
    <p class="font-normal text-sm sm:text-xs">
      {{ appStore.name }} requests your permission for
      {{ getPermissionText(request.request.method, request.request) }}
    </p>
    <div class="flex justify-end space-x-2 text-sm">
      <button class="uppercase" @click="emits('reject')">Reject</button>
      <button class="uppercase" @click="emits('approve')">Approve</button>
    </div>
  </div>
</template>
