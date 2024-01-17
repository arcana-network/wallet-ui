<script setup lang="ts">
import { type RpcConfig } from '@arcana/auth'
import {
  PublicKey,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js'
import { Decimal } from 'decimal.js'
import { type JsonRpcRequest } from 'json-rpc-engine'
import { connectToParent } from 'penpal'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'

import AppLoader from '@/components/AppLoader.vue'
import ExportKeyModal from '@/components/ExportKeyModal.vue'
import SendTokensPreview from '@/components/SendTokensPreview.vue'
import SendTransaction from '@/components/SendTransaction.vue'
import SignMessageAdvancedInfo from '@/components/signMessageAdvancedInfo.vue'
import { getEnabledChainList } from '@/services/chainlist.service'
import { getAppConfig } from '@/services/gateway.service'
import { EIP1559GasFee, LegacyGasFee } from '@/store/request'
import {
  CreateAccountHandler,
  EVMAccountHandler,
  SolanaAccountHandler,
} from '@/utils/accountHandler'
import { advancedInfo } from '@/utils/advancedInfo'
import { ChainType } from '@/utils/chainType'
import { getImage } from '@/utils/getImage'
import { methodAndAction } from '@/utils/method'
import {
  requestHandlerExists,
  setRequestHandler,
  getRequestHandler,
} from '@/utils/requestHandlerSingleton'
import { sanitizeRequest } from '@/utils/sanitizeRequest'
import { initStorage, getStorage } from '@/utils/storageWrapper'
import { truncateMid } from '@/utils/stringUtils'

const ARCANA_PRIVATE_KEY_METHOD = '_arcana_privateKey'
const ARCANA_SEND_TOKEN_METHOD = '_send_token'
const WALLET_DOMAIN_DEFAULT = '*'
const walletDomain = ref(WALLET_DOMAIN_DEFAULT)
const DEFAULT_THEME = 'dark'
const showLoader = ref(true)
const chainConfig = ref({})
const toast = useToast()
const appDetails = ref({})
const pendingQueue = ref([])
const route = useRoute()
const appId = route.params.appId as string

function postMessage(response) {
  const allowedDomain = walletDomain.value
  window.parent.opener.postMessage(
    {
      type: 'json_rpc_response',
      response,
    },
    allowedDomain
  )
}

function addToPendingQueue(requestObj) {
  pendingQueue.value.push(requestObj)
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

async function getAppDetails(appId: string) {
  const { data } = await getAppConfig(appId)
  return data
}

function initAccountHandler(rpcUrl) {
  const { privateKey } = getStorage().local.getUserInfo()
  if (!requestHandlerExists()) {
    const accountHandler = CreateAccountHandler(privateKey, rpcUrl)
    setRequestHandler(accountHandler)
  }
}

function setRPCConfigInRequestHandler(chainDetails) {
  const requestHandler = getRequestHandler()
  const rpcConfig = formatRPCConfig(chainDetails)
  requestHandler.setRpcConfig(rpcConfig)
}

function formatRPCConfig(config): RpcConfig {
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

    await connectToParent({
      methods: {
        sendRequest: async (r: {
          chainId: string
          request: JsonRpcRequest<unknown>
        }) => {
          await initFromChainId(r.chainId)
          addToPendingQueue(r)
        },
      },
    }).promise
    // V Add this for other requests
    // if (!checkIfMethodSupported(request.method as RequestMethod)) {
    //   denyProcessing(request.id)
    //   return
    // }
    initStorage(appId)
    updateTheme()
    const info = await getAppDetails(appId)
    appDetails.value = info
    const wallet_domain = info.wallet_domain
    walletDomain.value = wallet_domain.length
      ? wallet_domain
      : WALLET_DOMAIN_DEFAULT
  } catch (e) {
    console.log(e)
  } finally {
    showLoader.value = false
  }
})

let chainInit = false

async function initFromChainId(chainId: string) {
  if (!chainInit) {
    chainInit = true
    const chainDetails = await getChainDetails(appId, chainId)
    chainConfig.value = { ...chainDetails }
    initAccountHandler(chainDetails.rpc_url)
    setRPCConfigInRequestHandler(chainDetails)
  }
}

function setHexPrefix(value: string) {
  const hexPrefix = '0x'
  return value.startsWith(hexPrefix) ? value : `${hexPrefix}${value}`
}

async function onApprove(request) {
  const reqObj = pendingQueue.value[0]
  try {
    if (reqObj.requestOrigin === 'wallet-ui') {
      postMessage({ message: 'approve' })
    } else {
      showLoader.value = true
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
      postMessage(response)
    }
  } catch (e) {
    console.log(e)
    if (e.message && e.message.includes('postMessage')) {
      toast.error('Please make the request again')
    } else toast.error('something went wrong')
  } finally {
    pendingQueue.value.shift()
    showLoader.value = false
    if (pendingQueue.value.length === 0) {
      closeWindow()
    }
  }
}

function onReject(request) {
  const reqObj = pendingQueue.value[0]
  try {
    if (reqObj.requestOrigin === 'wallet-ui') {
      postMessage({ message: 'reject' })
    } else {
      const response = {
        jsonrpc: '2.0',
        error: 'user_deny',
        result: null,
        id: request.id,
      }
      postMessage(response)
    }
  } catch (e) {
    if (e.message && e.message.includes('postMessage')) {
      toast.error('Please make the request again')
    } else toast.error('something went wrong')
  } finally {
    pendingQueue.value.shift()
    if (pendingQueue.value.length === 0) {
      closeWindow()
    }
  }
}

async function handleSendToken(params) {
  const tokenDetails = JSON.parse(params.tokenDetails)
  const tokenList = JSON.parse(params.tokenList)
  const gas = JSON.parse(params.gas)
  let result = { chainId: chainConfig.value.chain_id }
  try {
    showLoader.value = true
    if (params.chainType === ChainType.solana_cv25519) {
      const accountHandler =
        getRequestHandler().getAccountHandler() as SolanaAccountHandler
      if (params.selectedToken === chainConfig.value.currency) {
        const blockHash = await accountHandler.getLatestBlockHash()
        const pk = accountHandler.publicKey
        const toPk = new PublicKey(params.recipientWalletAddress)
        const instructions = [
          SystemProgram.transfer({
            fromPubkey: pk,
            toPubkey: toPk,
            lamports: new Decimal(params.amount)
              .mul(Decimal.pow(10, 9))
              .toNumber(),
          }),
        ]
        const messageV0 = new TransactionMessage({
          payerKey: pk,
          recentBlockhash: blockHash,
          instructions,
        }).compileToV0Message()
        let transaction = new VersionedTransaction(messageV0)
        const transactionSent = await accountHandler.signAndSendTransaction(
          transaction.serialize()
        )
        result['transactionSent'] = transactionSent
      } else {
        const sig = await accountHandler.sendCustomToken({
          to: params.recipientWalletAddress,
          amount: params.amount,
          mint: tokenDetails.address,
          decimals: tokenDetails.decimals,
        })
        const tokenInfo = tokenList.find(
          (item) => item.address === tokenDetails.address
        )
        result = {
          ...result,
          tokenInfo,
          sig,
        }
      }
    } else {
      const accountHandler =
        getRequestHandler().getAccountHandler() as EVMAccountHandler
      let gasFees: string | null = null
      if (gas) {
        const maxFee = new Decimal(gas.maxFeePerGas).add(
          gas.maxPriorityFeePerGas || 1.5
        )
        const maxFeeInWei = maxFee.mul(Decimal.pow(10, 9))
        gasFees = maxFeeInWei.toHexadecimal()
      }
      if (params.selectedToken === chainConfig.value.currency) {
        const payload: any = {
          to: setHexPrefix(params.recipientWalletAddress),
          value: new Decimal(params.amount)
            .mul(Decimal.pow(10, 18))
            .toHexadecimal(),
          from: params.senderWalletAddress,
        }

        if (gasFees) {
          payload.gasPrice = gasFees
        }
        payload.gasLimit = gas?.gasLimit || params.estimatedGas

        const txHash = await accountHandler.sendTransaction(
          payload,
          params.senderWalletAddress
        )
        result['txHash'] = txHash
      } else {
        const tokenInfo = tokenList.value.find(
          (item) => item.address === params.selectedToken.address
        )
        const sendAmount = tokenInfo?.decimals
          ? new Decimal(params.amount)
              .mul(Decimal.pow(10, tokenInfo.decimals))
              .toHexadecimal()
          : new Decimal(params.amount).toHexadecimal()
        const transactionHash = await accountHandler.sendCustomToken(
          tokenInfo?.address,
          setHexPrefix(params.recipientWalletAddress),
          sendAmount,
          gasFees,
          params.estimatedGas
        )
        result = {
          ...result,
          amount: params.amount,
          tokenInfo,
          transactionHash,
        }
      }
    }
  } catch (err: any) {
    console.log(err)
    toast.error(err.reason || 'Something went wrong')
  } finally {
    const response = {
      jsonrpc: '2.0',
      error: null,
      result,
      id: params.id,
    }
    postMessage(response)
    pendingQueue.value.shift()
    showLoader.value = false
    if (pendingQueue.value.length === 0) {
      closeWindow()
    }
  }
}

function closeWindow() {
  window.parent.close()
}

function isArcanaPrivateKeyRequest(method) {
  return method === ARCANA_PRIVATE_KEY_METHOD
}

function isSendTokenRequest(method) {
  return method === ARCANA_SEND_TOKEN_METHOD
}

function handleGasPriceInput(value, request) {
  const gas = value
  const selectedRequest = request
  const params = selectedRequest?.params
  if (!Array.isArray(params)) return
  const param = params[0]
  if (param.type && Number(param.type) === 2) {
    const eipGas = gas as EIP1559GasFee | null
    if (eipGas?.maxPriorityFeePerGas) {
      param.maxPriorityFeePerGas = eipGas.maxPriorityFeePerGas
    } else if (eipGas?.maxPriorityFeePerGas === null) {
      delete param.maxPriorityFeePerGas
    }
    if (eipGas?.maxFeePerGas) {
      param.maxFeePerGas = eipGas.maxFeePerGas
    } else if (eipGas?.maxFeePerGas === null) {
      delete param.maxFeePerGas
    }
  } else {
    const legacyGas = gas as LegacyGasFee | null
    if (legacyGas?.gasPrice) {
      param.gasPrice = legacyGas.gasPrice
    } else if (legacyGas?.gasPrice === null) {
      delete param.gasPrice
    } else if ((gas as EIP1559GasFee | null)?.maxFeePerGas) {
      param.gasPrice = (gas as EIP1559GasFee).maxFeePerGas
    }
  }
  if (gas?.gasLimit) {
    param.gas = gas.gasLimit
  } else if (gas?.gasLimit === null) {
    delete param.gas
  }
}
</script>

<template>
  <div v-if="showLoader" class="flex-1 flex justify-center">
    <AppLoader message="Please wait..." />
  </div>
  <div
    v-for="({ request }, index) in pendingQueue"
    v-else
    :key="request.id"
    class="flex flex-col space-y-2 h-full justify-between"
    :class="{
      hidden: index !== 0,
    }"
  >
    <div class="flex space-x-2 bg-[#1F1F1F] p-4 rounded-md relative">
      <img
        v-if="!isArcanaPrivateKeyRequest(request?.method)"
        :src="getImage('arrow-circle-bi-dir.png')"
        alt="arrow-icon"
        class="w-8 h-8"
      />
      <div
        class="space-y-1 w-full"
        :class="{
          'text-center': isArcanaPrivateKeyRequest(request?.method),
        }"
      >
        <h1>{{ methodAndAction[request.method] }}</h1>
        <p class="text-xs text-[#8D8D8D]">
          {{ truncateMid(request.params[0]?.from, 6) }}
        </p>
      </div>
      <div v-if="pendingQueue.length > 1" class="absolute right-0 top-0">
        <div class="relative flex justify-end">
          <span
            class="absolute top-0 bg-red-500 rounded-full w-3.5 h-3.5 animate-ping"
          ></span>
          <span
            class="bg-red-500 rounded-full w-3.5 h-3.5 text-xs flex justify-center items-center z-[999]"
          >
            {{ pendingQueue.length }}
          </span>
        </div>
      </div>
    </div>
    <div class="h-5/6 rounded-md flex-1 flex flex-col space-y-4">
      <div class="flex-1 h-5/6">
        <div v-if="request?.method === ARCANA_PRIVATE_KEY_METHOD">
          <ExportKeyModal
            :private-key="request.params.privateKey"
            :wallet-address="request.params.walletAddress"
            :wallet-domain="walletDomain"
          />
        </div>
        <div v-else-if="request?.method === ARCANA_SEND_TOKEN_METHOD">
          <SendTokensPreview
            :preview-data="{
              senderWalletAddress: request.params.senderWalletAddress,
              recipientWalletAddress: request.params.recipientWalletAddress,
              amount: request.params.amount,
              gasFee: request.params.gasFee,
              selectedToken: request.params.selectedToken,
              estimatedGas: request.params.estimatedGas,
            }"
          />
        </div>
        <div v-else class="h-full overflow-auto">
          <SendTransaction
            v-if="isSendTransactionRequest(request?.method)"
            :request="{ request }"
            @gas-price-input="
              ({ value }) => handleGasPriceInput(value, request)
            "
            @reject="() => {}"
            @approve="() => {}"
          />
          <SignMessageAdvancedInfo
            v-else
            :info="advancedInfo(request.method, request.params)"
          />
        </div>
      </div>
      <div class="h-1/6">
        <div v-if="isArcanaPrivateKeyRequest(request?.method)">
          <button
            class="btn-primary h-10 p-2 uppercase w-full text-sm font-bold"
            @click="closeWindow()"
          >
            close tab
          </button>
        </div>
        <div v-else-if="isSendTokenRequest(request?.method)">
          <button
            class="btn-primary h-10 p-2 uppercase w-full text-sm font-bold"
            @click="handleSendToken(request.params)"
          >
            Send
          </button>
        </div>
        <div v-else class="flex gap-2">
          <button
            class="btn-secondary h-10 p-2 uppercase w-full text-sm font-bold"
            @click="onReject(request)"
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
  </div>
</template>
