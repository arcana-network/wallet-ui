<script setup lang="ts">
import { AppMode } from '@arcana/auth'
import { useRoute } from 'vue-router'

import { useAppStore } from '@/store/app'
import { useParentConnectionStore } from '@/store/parentConnection'
import { useRequestStore } from '@/store/request'

type SignMessageCompactProps = {
  title: string
  deprecated: boolean
  permission: string
  request: any
}

const props = defineProps<SignMessageCompactProps>()

const emits = defineEmits(['reject', 'approve'])

const appStore = useAppStore()
const route = useRoute()
const requestStore = useRequestStore()
const parentConnectionStore = useParentConnectionStore()

async function onViewDetails() {
  const c = await parentConnectionStore.parentConnection?.promise
  if (appStore.compactMode) {
    appStore.compactMode = false
  } else {
    appStore.standaloneMode == 1 || appStore.standaloneMode == 2
      ? c?.uiEvent('wallet_close', null)
      : (appStore.expandWallet = false)
  }
}
</script>

<template>
  <div class="card p-4 flex flex-col gap-8">
    <div class="flex flex-col gap-1">
      <div class="flex items-center justify-center">
        <h1 class="font-Nohemi m-0 text-[20px] font-semibold capitalize">
          {{ props.title }}
        </h1>
      </div>
      <p class="text-sm text-center">
        {{ appStore.name }} requests your permission for {{ props.permission }}.
        <button class="font-medium" @click.stop="onViewDetails">
          Learn More
        </button>
      </p>
      <span
        v-if="props.deprecated"
        class="text-xs text-yellow-100 font-medium text-center w-full"
        >WARNING: This is a deprecated method. Sign with caution.</span
      >
    </div>
    <div class="flex flex-col gap-4">
      <div class="flex justify-end gap-4 text-sm font-medium">
        <button
          class="uppercase btn-secondary w-full p-2"
          @click="emits('reject')"
        >
          Reject
        </button>
        <button
          class="uppercase btn-primary w-full p-2"
          @click="emits('approve')"
        >
          Approve
        </button>
      </div>
      <div
        v-if="
          route.name === 'requests' && appStore.validAppMode === AppMode.Full
        "
        class="flex items-center justify-center"
      >
        <button
          class="btn-tertiary text-sm font-medium"
          @click.stop="requestStore.skipRequest(props.request.request.id)"
        >
          Do this later
        </button>
      </div>
    </div>
  </div>
</template>
