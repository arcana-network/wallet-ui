<script setup lang="ts">
import { computed } from 'vue'

import RequestCountBadge from '@/components/RequestCountBadge.vue'
import { useAppStore } from '@/store/app'
import { useRequestStore } from '@/store/request'
import { getImage } from '@/utils/getImage'

const appStore = useAppStore()
const requestStore = useRequestStore()

function onClickOfButton() {
  appStore.expandWallet = true
}

const requestCount = computed(() => {
  return requestStore.pendingRequestsForApproval.length
})

const showRequestCountBadge = computed(() => {
  return requestStore.areRequestsPendingForApproval
})
</script>

<template>
  <div class="h-full relative">
    <div
      v-if="showRequestCountBadge"
      class="z-[999] absolute top-0"
      :class="[appStore.walletPosition === 'right' ? 'right-1' : 'left-1']"
    >
      <RequestCountBadge :request-count="requestCount" />
    </div>
    <button
      class="flex items-center justify-center flex-grow h-full w-full"
      @click="onClickOfButton"
    >
      <img :src="getImage('expand-arrow.svg')" />
    </button>
  </div>
</template>

<style scoped>
.container {
  background: var(--container-bg-color);
}
</style>
