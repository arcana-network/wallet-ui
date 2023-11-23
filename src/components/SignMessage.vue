<script setup lang="ts">
import { AppMode } from '@arcana/auth'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import SignMessageAdvancedInfo from '@/components/signMessageAdvancedInfo.vue'
import SignMessageCompact from '@/components/SignMessageCompact.vue'
import WalletAddEthereumChain from '@/components/WalletAddEthereumChain.vue'
import WalletSwitchEthereumChain from '@/components/WalletSwitchEthereumChain.vue'
import WalletWatchAssetErc20 from '@/components/WalletWatchAssetErc20.vue'
import WalletWatchAssetNFT from '@/components/WalletWatchAssetNFT.vue'
import { UNSUPPORTED_METHODS as DEPRECATED_METHODS } from '@/models/Connection'
import { useAppStore } from '@/store/app'
import { useRequestStore } from '@/store/request'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import { advancedInfo } from '@/utils/advancedInfo'
import { methodAndAction } from '@/utils/method'

const appStore = useAppStore()
const requestStore = useRequestStore()
const route = useRoute()
const rpcStore = useRpcStore()

const NFT_ERC_STANDARDS = ['erc721', 'erc1155']

const props = defineProps({
  request: {
    type: Object,
    required: true,
  },
})

const method = computed(() => props.request.request.method)
const params = computed(() => props.request.request.params)

const emits = defineEmits(['reject', 'approve', 'proceed'])
const userStore = useUserStore()

function isSiweMessage(message: string) {
  return (
    message.includes('wants you to sign in with your') &&
    message.includes('URI') &&
    message.includes('Nonce') &&
    message.includes('Version') &&
    message.includes('Issued At') &&
    message.toLowerCase().includes(userStore.walletAddress.toLowerCase())
  )
}

function getPermissionText() {
  let param: any
  if (params.value instanceof Array && params.value[0]) {
    param = params.value[0]
  }
  let response = 'performing an action'
  switch (method.value) {
    case 'wallet_addEthereumChain':
      response = param?.chainName
        ? `adding chain - ${param?.chainName}`
        : 'adding a chain'
      break
    case 'wallet_switchEthereumChain':
      if (param?.chainId) {
        const chainName = rpcStore.rpcConfigList.find(
          (chain) => Number(chain.chainId) === Number(param.chainId)
        )?.chainName
        response = chainName
          ? `switching chain - ${chainName}`
          : 'switching a chain'
      } else response = `switching a chain`
      break
    case 'wallet_watchAsset':
      response = ['erc721', 'erc1155'].includes(
        params.value.type?.toLowerCase()
      )
        ? 'adding a NFT'
        : 'adding a token'
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
    case 'signTransaction':
      response = 'signing a transaction'
      break
    case 'signAndSendTransaction':
      response = 'signing and sending a transaction'
      break
    case 'signMessage':
      response = 'signing a message'
      break
    case 'signAllTransactions':
      response = 'signing all transactions'
      break
    default:
      response = 'performing an action'
      break
  }
  return response
}

function isDeprecatedMethod() {
  return DEPRECATED_METHODS.includes(method.value)
}
</script>

<template>
  <SignMessageCompact
    v-if="appStore.compactMode"
    :deprecated="isDeprecatedMethod()"
    :title="methodAndAction[method]"
    :permission="getPermissionText()"
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
        {{ getPermissionText() }}
      </p>
      <span
        v-if="isDeprecatedMethod()"
        class="text-xs text-yellow-100 font-medium text-center w-full"
        >WARNING: This is a deprecated method. Sign with caution.</span
      >
    </div>
    <WalletAddEthereumChain
      v-if="method === 'wallet_addEthereumChain'"
      :params="params[0]"
      class="flex flex-col gap-1"
    />
    <WalletSwitchEthereumChain
      v-else-if="method === 'wallet_switchEthereumChain'"
      :params="params[0]"
      class="flex flex-col gap-1"
    />
    <WalletWatchAssetNFT
      v-else-if="
        method === 'wallet_watchAsset' &&
        params.type &&
        NFT_ERC_STANDARDS.includes(params.type.toLowerCase())
      "
      :params="props.request.request.nft"
      :type="params.type"
    />
    <WalletWatchAssetErc20
      v-else-if="method === 'wallet_watchAsset'"
      :params="props.request.request.token"
      class="flex flex-col gap-1"
    />
    <div v-else class="flex flex-col gap-1">
      <div class="text-sm">Message</div>
      <SignMessageAdvancedInfo
        :info="advancedInfo(request.request.method, request.request.params)"
      />
      <!-- <div
        v-if="method !== 'eth_signTransaction'"
        class="flex justify-center mt-4"
      >
        <div
          class="flex bg-white-100 border-1 border border-gray-300 dark:bg-gray-300 rounded-sm p-2 text-xs gap-1 dark:text-gray-100"
        >
          <img src="@/assets/images/info-circle.svg" />
          <span>You're not going to be charged</span>
        </div>
      </div> -->
    </div>
    <div class="mt-auto flex flex-col gap-4">
      <div v-if="request.requestOrigin === 'auth-verify'">
        <button
          class="btn-secondary p-2 uppercase w-full text-sm font-bold"
          @click="emits('proceed')"
        >
          Proceed
        </button>
      </div>
      <div v-else class="flex gap-2">
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
