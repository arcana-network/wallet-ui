<script setup lang="ts">
import { computed } from 'vue'

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
