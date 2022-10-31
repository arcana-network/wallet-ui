// Todo: Find a better place for these functions
import { ethErrors, serializeError } from 'eth-rpc-errors'
import { useToast } from 'vue-toastification'

import { requirePermission } from '@/models/Connection'
import { router } from '@/routes'
import { store } from '@/store'
import { useActivitiesStore } from '@/store/activities'
import { useRpcStore } from '@/store/rpc'

const activitiesStore = useActivitiesStore(store)
const rpcStore = useRpcStore(store)
const toast = useToast()

function getSendRequestFn(handleRequest, requestStore, appStore, keeper) {
  return function sendRequest(request) {
    return handleRequest(request, requestStore, appStore, keeper)
  }
}

async function watchRequestQueue(reqStore, keeper) {
  reqStore.$subscribe(async (_, state) => {
    const { processQueue, pendingRequests } = state
    const pendingRequestCount = Object.values(pendingRequests).length
    const connectionInstance = await keeper.connection.promise
    try {
      connectionInstance.sendPendingRequestCount(pendingRequestCount)
    } catch (err) {
      console.error({ err })
    }
    while (processQueue.length > 0) {
      const request = processQueue.shift()
      processRequest(request, keeper)
      try {
        connectionInstance.sendPendingRequestCount(pendingRequestCount)
      } catch (err) {
        console.error({ err })
      }
    }
  })
}

function getEtherInvalidParamsError(msg) {
  return serializeError(ethErrors.rpc.invalidParams(msg))
}

function switchChain(request, keeper) {
  const { chainId } = request.params[0]
  rpcStore.setSelectedChainId(`${parseInt(chainId)}`)
  keeper.reply(request.method, {
    result: `Chain changed to ${rpcStore.selectedRpcConfig.chainName}`,
    id: request.id,
  })
  router.push({ name: 'home' })
}

function isExistingRpcUrl(url) {
  const exisitingRpcUrls = rpcStore.rpcConfigList
    .map((chain) => chain.rpcUrls)
    .flat()

  return exisitingRpcUrls.some((rpcUrl) => {
    return rpcUrl === url
  })
}

function isExistingChainId(chainId) {
  return rpcStore.rpcConfigList.some((chain) => chain.chainId === chainId)
}

function validateSwitchChainParams({ chainId }) {
  const rpcConfigs = rpcStore.rpcConfigs
  const result: { isValid: boolean; error: unknown } = {
    isValid: false,
    error: null,
  }
  if (!chainId) {
    result.error = 'Please provide chain id'
  } else if (!(rpcConfigs && rpcConfigs[parseInt(chainId)])) {
    result.error = serializeError(
      ethErrors.provider.custom({
        code: 4902,
        message: `Chain Id ${chainId} is not in the list`,
      })
    )
  } else {
    result.error = ''
    result.isValid = true
  }
  return result
}

function validateAddNetworkParams(networkInfo) {
  const result: { isValid: boolean; error: unknown } = {
    isValid: false,
    error: null,
  }

  if (
    !networkInfo.chainName?.length ||
    !(
      Array.isArray(networkInfo.rpcUrls) &&
      networkInfo.rpcUrls.length > 0 &&
      networkInfo.rpcUrls[0] &&
      networkInfo.rpcUrls[0].length > 0
    ) ||
    !networkInfo.chainId ||
    !networkInfo.nativeCurrency?.symbol.length
  ) {
    result.error = getEtherInvalidParamsError('required params missing')
  } else if (isExistingRpcUrl(networkInfo.rpcUrls[0])) {
    result.error = getEtherInvalidParamsError(
      `RPC URL - ${networkInfo.rpcUrls[0]} already exists, please use different one`
    )
  } else if (isExistingChainId(parseInt(networkInfo.chainId))) {
    result.error = getEtherInvalidParamsError(
      `Chain ID - ${networkInfo.chainId} already exists, please use different one`
    )
  } else {
    result.error = ''
    result.isValid = true
  }
  return result
}

function addNetwork(request, keeper) {
  const { method, params } = request
  const networkInfo = params[0]
  const name: string = networkInfo.chainName || ''
  const rpcUrls: string[] = networkInfo.rpcUrls || []
  const chainId = parseInt(networkInfo.chainId) || 0
  const symbol: string = networkInfo.nativeCurrency.symbol || ''

  const payload = {
    chainName: name,
    chainId: String(chainId),
    blockExplorerUrls: networkInfo.blockExplorerUrls,
    rpcUrls: rpcUrls,
    favicon: 'blockchain-icon',
    isCustom: true,
    nativeCurrency: {
      symbol: symbol,
      decimals: networkInfo.nativeCurrency.decimals || 18,
    },
  }
  rpcStore.addNetwork(payload)
  router.push({ name: 'home' })

  keeper.reply(method, {
    result: `Added the network ${networkInfo.chainName} and set it as current`,
    id: request.id,
  })
}

async function processRequest({ request, isPermissionGranted }, keeper) {
  if (isPermissionGranted) {
    if (
      request.method === 'wallet_switchEthereumChain' ||
      request.method === 'wallet_addEthereumChain'
    ) {
      const { method } = request
      if (method === 'wallet_switchEthereumChain') switchChain(request, keeper)
      if (method === 'wallet_addEthereumChain') addNetwork(request, keeper)
    } else {
      if (request.method === 'eth_sendTransaction') {
        request.params[0].gasLimit = request.params[0].gas
        delete request.params[0].gas
      }
      try {
        const response = await keeper.request(request)
        keeper.reply(request.method, response)
        if (response.error) {
          if (response.error.data?.originalError?.code) {
            toast.error(response.error.data.originalError.code)
          } else {
            toast.error(response.error)
          }
          return
        }
        if (request.method === 'eth_signTypedData_v4' && request.params[1]) {
          const params = JSON.parse(request.params[1])
          if (params.domain.name === 'Arcana Forwarder') {
            activitiesStore.saveFileActivity(
              rpcStore.selectedRpcConfig?.chainId,
              params.message,
              params.domain.verifyingContract
            )
          }
        }
        if (request.method === 'eth_sendTransaction' && response.result) {
          activitiesStore.fetchAndSaveActivityFromHash({
            txHash: response.result,
            chainId: rpcStore.selectedRpcConfig?.chainId,
          })
        }
      } catch (error) {
        console.error({ error })
      }
    }
  } else {
    keeper.reply(request.method, {
      error: 'user_deny',
      result: null,
      id: request.id,
    })
  }
}

async function handleRequest(request, requestStore, appStore, keeper) {
  if (request.method === 'wallet_addEthereumChain') {
    const validationResponse = validateAddNetworkParams(request.params[0])
    if (!validationResponse.isValid) {
      keeper.reply(request.method, {
        error: validationResponse.error,
        result: null,
        id: request.id,
      })
      return
    }
  }

  if (request.method === 'wallet_switchEthereumChain') {
    const validationResponse = validateSwitchChainParams(request.params[0])
    if (!validationResponse.isValid) {
      keeper.reply(request.method, {
        error: validationResponse.error,
        result: null,
        id: request.id,
      })
      return
    }
  }
  if (request.method === 'eth_signTypedData_v4') {
    const params = JSON.parse(request.params[1])
    let error: string | unknown | null = null
    if (
      typeof params !== 'object' ||
      !params.domain ||
      !params.domain.chainId
    ) {
      error = getEtherInvalidParamsError('required params missing')
    } else if (
      parseInt(params.domain.chainId) !== parseInt(rpcStore.selectedChainId)
    ) {
      error = `domain chain ID ${params.domain.chainId} does not match network chain id ${rpcStore.selectedChainId}`
    }
    keeper.reply(request.method, {
      error,
      result: null,
      id: request.id,
    })
    if (error) return
  }
  const isPermissionRequired = requirePermission(request, appStore.validAppMode)
  requestStore.addRequests(request, isPermissionRequired, new Date())
}

export { getSendRequestFn, watchRequestQueue, handleRequest }
