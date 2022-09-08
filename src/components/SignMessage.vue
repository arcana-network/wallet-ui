<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

import DateTime from '@/components/DateTime.vue'
import SignMessageAdvancedInfo from '@/components/signMessageAdvancedInfo.vue'
import type { Request } from '@/models/Connection'
import { useAppStore } from '@/store/app'
import { useRpcStore } from '@/store/rpc'
import { advancedInfo } from '@/utils/advancedInfo'
import { methodAndAction } from '@/utils/method'
import { useImage } from '@/utils/useImage'

const appStore = useAppStore()
const rpcStore = useRpcStore()
const getImage = useImage()

const { rpcConfig } = storeToRefs(rpcStore)
const showAdvancedInfo = ref(false)

defineProps({
  request: {
    type: Request,
    required: true,
  },
})
</script>

<template>
  <div class="flex flex-1 flex-col space-y-4 sm:space-y-3">
    <div class="flex items-baseline">
      <h1 class="flex-1 m-0 font-semibold text-sm">Sign Message</h1>
      <DateTime :datetime="request.receivedTime" />
    </div>
    <p class="font-normal text-sm sm:text-xs">
      {{ appStore.name }} requests your permission to perform the following
      action:
    </p>
    <div>
      <p class="text-sm sm:text-xs text-zinc-400">Network</p>
      <p class="text-base sm:text-sm">
        {{ rpcConfig.chainName }}
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
