<script setup lang="ts">
import { AppMode } from '@arcana/auth'
import { useRoute } from 'vue-router'

import SignMessageAdvancedInfo from '@/components/signMessageAdvancedInfo.vue'
import SignMessageCompact from '@/components/SignMessageCompact.vue'
import { useAppStore } from '@/store/app'
import { useRequestStore } from '@/store/request'
import { useUserStore } from '@/store/user'
import { advancedInfo } from '@/utils/advancedInfo'
import { methodAndAction } from '@/utils/method'

const appStore = useAppStore()
const requestStore = useRequestStore()
const route = useRoute()

defineProps({
  request: {
    type: Object,
    required: true,
  },
})

const emits = defineEmits(['reject', 'approve'])
const userStore = useUserStore()

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

function isDeprecatedMethod(method) {
  return method === 'eth_sign'
}
</script>

<template>
  <SignMessageCompact
    v-if="appStore.compactMode"
    :deprecated="isDeprecatedMethod(request.request.method)"
    :title="methodAndAction[request.request.method]"
    :permission="getPermissionText(request.request.method, request.request)"
    :request="request"
    @approve="emits('approve')"
    @reject="emits('reject')"
  />
  <div v-else class="card flex flex-1 flex-col gap-4 p-4">
    <div class="flex flex-col">
      <h1 class="flex-1 m-0 font-bold text-lg text-center capitalize">
        {{ methodAndAction[request.request.method] }}
      </h1>
      <p class="text-xs text-gray-100 text-center">
        {{ appStore.name }} requests your permission for
        {{ getPermissionText(request.request.method, request.request) }}
      </p>
      <span
        v-if="isDeprecatedMethod(request.request.method)"
        class="text-xs text-yellow-100 font-medium text-center w-full"
        >WARNING: This is a deprecated method. Sign with caution.</span
      >
    </div>
    <div class="flex flex-col gap-1">
      <div class="text-sm">Message</div>
      <SignMessageAdvancedInfo
        :info="advancedInfo(request.request.method, request.request.params)"
      />
      <div class="flex justify-center mt-4">
        <div
          class="flex bg-white-100 border-1 border border-gray-300 dark:bg-gray-300 rounded-sm p-2 text-xs gap-1 dark:text-gray-100"
        >
          <img src="@/assets/images/info-circle.svg" />
          <span>You're not going to be charged</span>
        </div>
      </div>
    </div>
    <div class="mt-auto flex flex-col gap-4">
      <div class="flex gap-2">
        <button
          class="btn-secondary p-2 uppercase w-full text-sm font-bold"
          @click="emits('reject')"
        >
          Reject
        </button>
        <button
          class="btn-primary p-2 uppercase w-full text-sm font-bold"
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
