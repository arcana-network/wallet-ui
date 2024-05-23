<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAppStore } from '@/store/app'
import { useRequestStore } from '@/store/request'
import { getImage } from '@/utils/getImage'

const appStore = useAppStore()
const requestStore = useRequestStore()
const route = useRoute()
const router = useRouter()

function onClickOfButton() {
  appStore.expandWallet = true
  if (
    (requestStore.areRequestsPendingForApproval ||
      requestStore.skippedRequestsPendingForApprovalLength > 0) &&
    route.name !== 'requests'
  ) {
    router.push({ name: 'activities' })
  }
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
      class="flex items-start justify-center flex-grow h-full w-full pt-[6px]"
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
