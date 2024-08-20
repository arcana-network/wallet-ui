<script setup lang="ts">
import { AppMode } from '@arcana/auth'
import { computed, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'

import { UNSUPPORTED_METHODS as DEPRECATED_METHODS } from '@/models/Connection'
import { useAppStore } from '@/store/app'
import { useRequestStore } from '@/store/request'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import { advancedInfo } from '@/utils/advancedInfo'
import { ChainType } from '@/utils/chainType'
import { getImage } from '@/utils/getImage'
import { methodAndAction } from '@/utils/method'

const WalletAddEthereumChain = defineAsyncComponent(
  () =>
    import('@/components/CustomRequestScreen/Evm/WalletAddEthereumChain.vue')
)
const WalletSwitchEthereumChain = defineAsyncComponent(
  () =>
    import('@/components/CustomRequestScreen/Evm/WalletSwitchEthereumChain.vue')
)
const WalletWatchAssetErc20 = defineAsyncComponent(
  () => import('@/components/CustomRequestScreen/Evm/WalletWatchAssetErc20.vue')
)
const WalletWatchAssetNFT = defineAsyncComponent(
  () => import('@/components/CustomRequestScreen/Evm/WalletWatchAssetNFT.vue')
)
const SignMessageCompact = defineAsyncComponent(
  () => import('@/components/SignMessageCompact.vue')
)
const SignMessageAdvancedInfo = defineAsyncComponent(
  () => import('@/components/signMessageAdvancedInfo.vue')
)
const ArcanaSwitchAccountType = defineAsyncComponent(
  () =>
    import('@/components/CustomRequestScreen/Evm/ArcanaSwitchAccountType.vue')
)
const MVXSignTransaction = defineAsyncComponent(
  () => import('@/components/CustomRequestScreen/Mvx/MVXSignTransaction.vue')
)
const NearSignAndSendTransaction = defineAsyncComponent(
  () =>
    import(
      '@/components/CustomRequestScreen/Near/NearSignAndSendTransaction.vue'
    )
)
const MVXSignTransactions = defineAsyncComponent(
  () => import('@/components/CustomRequestScreen/Mvx/MVXSignTransactions.vue')
)
const SolanaSignTransaction = defineAsyncComponent(
  () => import('@/components/CustomRequestScreen/Solana/SignTransaction.vue')
)
const SolanaSignAllTransactions = defineAsyncComponent(
  () =>
    import('@/components/CustomRequestScreen/Solana/SignAllTransactions.vue')
)
const EthSignTypedDataV4 = defineAsyncComponent(
  () => import('@/components/CustomRequestScreen/Evm/EthSignTypedDataV4.vue')
)

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
  shrinkMode: {
    type: Boolean,
    default: false,
  },
})

const method = computed(() => props.request.request.method)
const params = computed(() => props.request.request.params)

const emits = defineEmits(['reject', 'approve', 'proceed', 'expand', 'shrink'])
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
    case '_arcana_switchAccountType':
      response = 'switching account type'
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
    case 'signMessage':
    case 'near_signMessage':
    case 'mvx_signMessage':
      response = 'signing a message'
      break
    case 'eth_signTypedData_v4':
      response = 'signing typed data'
      break
    case 'eth_decrypt':
      response = 'decrypting data'
      break
    case 'eth_signTransaction':
    case 'signTransaction':
    case 'mvx_signTransaction':
      response = 'signing a transaction'
      break
    case 'signAndSendTransaction':
    case 'near_signAndSendTransaction':
      response = 'signing and sending a transaction'
      break
    case 'signAllTransactions':
    case 'mvx_signTransactions':
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
  <div
    v-else-if="shrinkMode"
    class="flex flex-col justify-between p-3 space-y-2"
  >
    <div class="flex justify-between" @click="emits('expand')">
      <div class="flex cursor-pointer">
        <h1 class="font-Nohemi text-lg font-medium">
          {{ methodAndAction[request.request.method] }}
        </h1>
        <img :src="getImage('arrow-down.svg')" alt="" />
      </div>
      <div>
        <span class="text-red-pink-orange text-xs">Pending</span>
      </div>
    </div>
    <div>
      <p class="text-xs text-gray-spanish-light">
        {{ appStore.name }} requests your permission for
        {{ getPermissionText() }}
      </p>
    </div>
  </div>
  <div v-else class="card flex flex-1 flex-col gap-4 p-4">
    <div class="flex flex-col">
      <div
        v-if="route.name === 'activities'"
        class="flex justify-center items-center cursor-pointer"
        @click="emits('shrink')"
      >
        <h1
          class="font-Nohemi m-0 text-[20px] font-medium text-center capitalize"
        >
          {{ methodAndAction[method] }}
        </h1>
        <img :src="getImage('arrow-down.svg')" alt="" class="rotate-180" />
      </div>
      <h1
        v-else
        class="font-Nohemi flex-1 m-0 text-[20px] font-medium text-center capitalize"
      >
        {{ methodAndAction[method] }}
      </h1>
      <p class="text-xs text-gray-spanish-light text-center">
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
    <EthSignTypedDataV4
      v-else-if="method === 'eth_signTypedData_v4'"
      :request-params="params"
    />
    <ArcanaSwitchAccountType
      v-else-if="method === '_arcana_switchAccountType'"
      :account-type="params.type"
    />
    <MVXSignTransaction
      v-else-if="method === 'mvx_signTransaction'"
      :transaction="params.transaction"
    />
    <MVXSignTransactions
      v-else-if="method === 'mvx_signTransactions'"
      :transactions="params.transactions"
    />
    <NearSignAndSendTransaction
      v-else-if="method === 'near_signAndSendTransaction'"
      :transaction="params.transaction"
    />
    <SolanaSignTransaction
      v-else-if="
        ['signTransaction', 'signAndSendTransaction'].includes(method) &&
        appStore.chainType === ChainType.solana_cv25519
      "
      :message="params.message"
    />
    <SolanaSignAllTransactions
      v-else-if="
        method === 'signAllTransactions' &&
        appStore.chainType === ChainType.solana_cv25519
      "
      :message="params.message"
    />
    <div v-else class="flex flex-col gap-1">
      <div class="text-sm">Message</div>
      <SignMessageAdvancedInfo
        :info="advancedInfo(request.request.method, request.request.params)"
      />
    </div>
    <div class="mt-auto flex flex-col gap-4">
      <div v-if="request.requestOrigin === 'auth-verify'">
        <button
          class="btn-secondary p-2 w-full text-sm font-medium"
          @click="emits('proceed')"
        >
          Proceed
        </button>
      </div>
      <div v-else class="flex gap-2">
        <button
          class="btn-secondary p-2 w-full text-sm font-medium"
          @click="emits('reject')"
        >
          Reject
        </button>
        <button
          class="btn-primary p-2 w-full text-sm font-medium"
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
          @click.stop="requestStore.skipRequest(request.request.id)"
        >
          Do this later
        </button>
      </div>
    </div>
  </div>
</template>
