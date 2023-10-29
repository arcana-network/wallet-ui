<script setup lang="ts">
import { type JsonRpcRequest } from 'json-rpc-engine'
import { Ref, onMounted, ref } from 'vue'

import AppLoader from '@/components/AppLoader.vue'
import SendTransaction from '@/components/PermissionRequest/SendTransaction.vue'
import SignMessageAdvancedInfo from '@/components/signMessageAdvancedInfo.vue'
import { getEnabledChainList } from '@/services/chainlist.service'
import { AccountHandler } from '@/utils/accountHandler'
import { advancedInfo } from '@/utils/advancedInfo'
import { getImage } from '@/utils/getImage'
import { decodeJSON } from '@/utils/hash'
import { methodAndAction } from '@/utils/method'
import {
  requestHandlerExists,
  setRequestHandler,
  getRequestHandler,
} from '@/utils/requestHandlerSingleton'
import { sanitizeRequest } from '@/utils/sanitizeRequest'
import { initStorage, getStorage } from '@/utils/storageWrapper'
import { truncateMid } from '@/utils/stringUtils'

type DecodedHash = {
  appId: string
  chainId: string
  request: JsonRpcRequest<unknown>
}

const DEFAULT_THEME = 'dark'
const showLoader = ref(true)
const chainConfig = ref({})
const request: Ref<JsonRpcRequest<unknown> | null> = ref(null)

function decodeHash(): DecodedHash {
  const hash = window.location.hash.substring(1)
  return decodeJSON(hash)
}

function updateTheme() {
  const theme = getStorage().local.getThemePreference()
  const htmlEl = document.getElementsByTagName('html')[0]
  htmlEl.classList.add(theme || DEFAULT_THEME)
}

const isSendTransactionRequest = (method: string) => {
  return method === 'eth_sendTransaction'
}

async function getChainDetails(appId: string, chainId: string) {
  const { chains } = await getEnabledChainList(appId)
  const chainId_int = Number(chainId)
  return chains.find((chain) => chain.chain_id === chainId_int)
}

function initAccountHandler(rpcUrl) {
  const { privateKey } = getStorage().local.getUserInfo()
  if (!requestHandlerExists()) {
    const accountHandler = new AccountHandler(privateKey, rpcUrl)
    setRequestHandler(accountHandler)
  }
}

function setRPCConfigInRequestHandler(chainDetails) {
  const requestHandler = getRequestHandler()
  requestHandler.setRpcConfig(formatRPCConfig(chainDetails))
}

function formatRPCConfig(config) {
  return {
    chainId: config.chain_id,
    blockExplorerUrls: [config.exp_url],
    rpcUrls: [config.rpc_url],
    nativeCurrency: {
      symbol: config.currency,
      decimals: 18,
    },
  }
}

onMounted(async () => {
  try {
    showLoader.value = true
    const decodedHash = decodeHash()
    request.value = { ...decodedHash.request }
    initStorage(decodedHash.appId)
    updateTheme()
    const chainDetails = await getChainDetails(
      decodedHash.appId,
      decodedHash.chainId
    )
    chainConfig.value = { ...chainDetails }
    initAccountHandler(chainDetails.rpc_url)
    setRPCConfigInRequestHandler(chainDetails)
  } catch (e) {
    console.log(e)
  } finally {
    showLoader.value = false
  }
})

const onApprove = async (request) => {
  if (isSendTransactionRequest(request.method)) {
    if (Array.isArray(request.params)) {
      const param = request.params[0]
      const gasPrice = String(param.gasPrice)
      if (!gasPrice.length) {
        alert('Please provide Gas Fee')
        return
      }
    }
  }
  const sanitizedRequest = sanitizeRequest({ ...request })
  const response = await getRequestHandler().request(sanitizedRequest)
  const allowedDomain = '*'
  // ^ Get domain from gateway, default = *
  try {
    window.parent?.opener?.postMessage(
      {
        type: 'json_rpc_response',
        response,
      },
      allowedDomain
    )
    console.log({ response })
  } catch (e) {
    console.log({ e })
  }
}
</script>

<template>
  <div v-if="showLoader" class="flex-1 flex justify-center">
    <AppLoader message="Please wait..." />
  </div>
  <div v-else class="flex flex-col space-y-3">
    <div class="flex space-x-2 bg-[#1F1F1F] p-4 rounded-md">
      <img
        :src="getImage('arrow-circle-bi-dir.png')"
        alt="arrow-icon"
        class="w-8 h-8"
      />
      <div class="space-y-1">
        <h1>{{ methodAndAction[request.method] }}</h1>
        <p class="text-xs text-[#8D8D8D]">
          {{ truncateMid(request.params[0].from, 6) }}
        </p>
      </div>
    </div>
    <div class="bg-[#1F1F1F] p-4 rounded-md flex-1 flex flex-col space-y-4">
      <div class="flex-1">
        <SendTransaction
          v-if="isSendTransactionRequest(request.method)"
          :request="request!"
          :chain-config="chainConfig"
        />
        <SignMessageAdvancedInfo
          v-else
          :info="advancedInfo(request.method, request.params)"
        />
      </div>
      <div class="flex gap-2">
        <button
          class="btn-secondary h-10 p-2 uppercase w-full text-sm font-bold"
        >
          Reject
        </button>
        <button
          class="btn-primary h-10 p-2 uppercase w-full text-sm font-bold"
          @click="onApprove(request)"
        >
          Approve
        </button>
      </div>
    </div>
  </div>
</template>
