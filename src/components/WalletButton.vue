<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAppStore } from '@/store/app'
import { useRequestStore } from '@/store/request'
import { getImage } from '@/utils/getImage'
import { useSVGInjector } from '@/utils/useSvgInjector.ts'

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

const expandContainer = ref<HTMLElement | null>(null)

const svgRefs = [expandContainer]

const { fetchAndInjectSVG } = useSVGInjector(svgRefs, true)
</script>

<template>
  <div class="h-full relative">
    <button
      class="flex items-start justify-center flex-grow h-full w-full pt-[6px]"
      @click="onClickOfButton"
    >
      <div ref="expandContainer">
        <img
          :src="getImage('expand-arrow.svg')"
          alt="Expand Icon"
          :style="{
            fill: appStore.theme_settings.font_color + '!important',
          }"
          @load="(event) => fetchAndInjectSVG(event, 0)"
        />
      </div>
    </button>
  </div>
</template>

<style scoped>
.container {
  background: var(--container-bg-color);
}
</style>
