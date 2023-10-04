<script setup lang="ts">
import { AppMode } from '@arcana/auth'
import { useRoute } from 'vue-router'

import { useAppStore } from '@/store/app'
import { useParentConnectionStore } from '@/store/parentConnection'
import { useRequestStore } from '@/store/request'
import { useUserStore } from '@/store/user'
import { methodAndAction } from '@/utils/method'

defineProps({
  request: {
    type: Object,
    required: true,
  },
})

const emits = defineEmits(['reject', 'approve'])

const appStore = useAppStore()
const route = useRoute()
const requestStore = useRequestStore()
const parentConnectionStore = useParentConnectionStore()
const userStore = useUserStore()

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

function isSiweMessage(message: string) {
  return (
    message.includes('wants you to sign in with your Ethereum account') &&
    message.includes('URI') &&
    message.includes('Nonce') &&
    message.includes('Version') &&
    message.includes('Issued At') &&
    message.toLowerCase().includes(userStore.walletAddress.toLowerCase())
  )
}

function getPermissionText(method, request) {
  const { params } = request
  let param: any
  if (params instanceof Array && params[0]) {
    param = params[0]
  }
  let response = 'performing an action'
  switch (method) {
    case 'wallet_addEthereumChain':
      response = param?.chainName
        ? `adding chain - ${param?.chainName}`
        : 'adding a chain'
      break
    case 'wallet_switchEthereumChain':
      response = param?.chainName
        ? `switching chain - ${param?.chainName}`
        : 'switching a chain'
      break
    case 'wallet_watchAsset':
      response = 'adding a token'
      break
    case 'eth_sendTransaction':
      response = 'sending a transaction'
      break
    case 'personal_sign':
      if (isSiweMessage(param)) {
        response = 'log in'
      } else {
        response = 'signing a message'
      }
      break
    case 'eth_sign':
      response = 'signing a message'
      break
    case 'eth_signTypedData_v4':
      response = 'signing typed data'
      break
    case 'eth_decrypt':
      response = 'decrypting data'
      break
    case 'eth_signTransaction':
      response = 'signing a transaction'
      break
    default:
      response = 'performing an action'
      break
  }
  return response
}

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

function isDeprecatedMethod(method) {
  return method === 'eth_sign'
}
</script>

<template>
  <div class="card p-4 flex flex-col gap-8">
    <div class="flex flex-col gap-1">
      <div class="flex items-center justify-center">
        <h1 class="m-0 font-bold text-lg capitalize">
          {{ getTitle(methodAndAction[request.request.method]) }}
        </h1>
      </div>
      <p class="text-sm text-center">
        {{ appStore.name }} requests your permission for
        {{ getPermissionText(request.request.method, request.request) }}.
        <button class="font-bold" @click.stop="onViewDetails">
          Learn More
        </button>
      </p>
      <span
        v-if="isDeprecatedMethod(request.request.method)"
        class="text-xs text-yellow-100 font-medium"
        >WARNING: This is a deprecated method. Sign with caution.</span
      >
    </div>
    <div class="flex flex-col gap-4">
      <div class="flex justify-end gap-4 text-sm font-bold">
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
          class="btn-tertiary text-sm font-bold"
          @click.stop="requestStore.skipRequest(request.request.id)"
        >
          Do this later
        </button>
      </div>
    </div>
  </div>
</template>
