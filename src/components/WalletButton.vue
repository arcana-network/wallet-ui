<script setup lang="ts">
import { Wallet } from 'ethers'
import { computed, toRefs } from 'vue'

import RequestCountBadge from '@/components/RequestCountBadge.vue'
import { useAppStore } from '@/store/app'
import { useRequestStore } from '@/store/request'
import { useImage } from '@/utils/useImage'

const appStore = useAppStore()
const requestStore = useRequestStore()
const getImage = useImage()
const { walletPosition } = toRefs(appStore)

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
    <div v-if="showRequestCountBadge" class="z-[999] absolute top-4 left-2">
      <RequestCountBadge :request-count="requestCount" />
    </div>
    <button
      class="container | absolute bottom-0 w-14 h-11 flex justify-center items-center cursor-pointer"
      :class="[
        walletPosition === 'right' ? 'rounded-l-[10px]' : 'rounded-r-[10px]',
        walletPosition === 'right' ? 'right-0' : 'left-0',
      ]"
      @click="onClickOfButton"
    >
      <img
        :src="getImage('arrow-icon')"
        alt="arrow icon"
        :class="[walletPosition === 'right' ? 'rotate-90' : 'rotate-[270deg]']"
      />
    </button>
  </div>
</template>

<style scoped>
.container {
  background: var(--container-bg-color);
}
</style>
