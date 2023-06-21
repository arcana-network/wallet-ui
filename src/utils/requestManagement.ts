// Todo: Find a better place for these functions
import { AppMode } from '@arcana/auth'
import { ethErrors, serializeError } from 'eth-rpc-errors'
import { ethers } from 'ethers'
import { watch } from 'vue'
import { useToast } from 'vue-toastification'

import type { AssetContract } from '@/models/Asset'
import { PERMISSIONS, requirePermission } from '@/models/Connection'
import { router } from '@/routes'
import { NFTDB } from '@/services/nft.service'
import { store } from '@/store'
import { useActivitiesStore } from '@/store/activities'
import { useAppStore } from '@/store/app'
import { useRequestStore } from '@/store/request'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import { TOAST_TIME_OUT } from '@/utils/constants'
import { getRequestHandler } from '@/utils/requestHandlerSingleton'
import { getStorage } from '@/utils/storageWrapper'
import validatePopulateContractForNft from '@/utils/validateAndPopulateContractForNft'
import validatePopulateContractForToken from '@/utils/validateAndPopulateContractForToken'

const activitiesStore = useActivitiesStore(store)
const rpcStore = useRpcStore(store)
const userStore = useUserStore(store)
const toast = useToast()
const reqStore = useRequestStore()
const appStore = useAppStore()

async function showToast(type, message) {
  return new Promise((res) => {
    if (appStore.expandWallet) {
      if (type === 'error') toast.error(message)
      if (type === 'success') toast.success(message)
      setTimeout(() => res(true), TOAST_TIME_OUT)
    } else {
      res(true)
    }
  })
}

function getSendRequestFn(handleRequest, requestStore, appStore, keeper) {
  return function sendRequest(request) {
    return handleRequest(request, requestStore, appStore, keeper)
  }
}

let unwatchRequestQueue

async function watchRequestQueue(keeper) {
  if (unwatchRequestQueue) {
    unwatchRequestQueue()
  }

  unwatchRequestQueue = watch(
    () => reqStore,
    async () => {
      const { processQueue, pendingRequests } = reqStore
      const pendingRequestCount = Object.values(pendingRequests).length
      const connectionInstance = await keeper.connection.promise
      const appMode = await connectionInstance.getAppMode()
      if (processQueue.length > 0) {
        const request = processQueue.shift()
        if (request) await processRequest(request, keeper)
        const method = request?.request.method
        if (
          appMode === AppMode.Widget &&
          !pendingRequestCount &&
          appStore.sdkVersion !== 'v3'
        ) {
          connectionInstance.closePopup()
        } else if (!pendingRequestCount && method && PERMISSIONS[method]) {
          if (appStore.standaloneMode == 1) {
            appStore.expandWallet = true
            appStore.compactMode = false
          } else {
            appStore.compactMode = false
            if (appStore.expandedByRequest) {
              appStore.expandedByRequest = false
              appStore.expandWallet = false
            }
          }
        }
      }
      if (!pendingRequestCount) {
        appStore.compactMode = false
        if (appStore.expandedByRequest) {
          appStore.expandedByRequest = false
          appStore.expandWallet = appStore.standaloneMode !== 0
        }
      }
    },
    { deep: true }
  )
}

function getEtherInvalidParamsError(msg) {
  return serializeError(ethErrors.rpc.invalidParams(msg))
}

async function switchChain(request, keeper) {
  const { chainId: id } = request.params[0]
  rpcStore.setSelectedChainId(`${parseInt(id)}`)

  const selectedChainId = Number(rpcStore.selectedRpcConfig?.chainId)
  await keeper.setRpcConfig({
    ...rpcStore.selectedRpcConfig,
    chainId: selectedChainId,
  })

  keeper.reply(request.method, {
    result: `Chain changed to ${rpcStore.selectedRpcConfig?.chainName}`,
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

function isExistingChain(chainId) {
  return rpcStore.rpcConfigList.find(
    (chain) => Number(chain.chainId) === Number(chainId)
  )
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

async function validateRPCandChainID(rpcURL, chainId) {
  const result: { isValid: boolean; error: unknown } = {
    isValid: false,
    error: null,
  }
  try {
    const provider = new ethers.providers.StaticJsonRpcProvider(rpcURL)
    const { chainId: fetchedChainId } = await provider.getNetwork()
    const isValidChainId = Number(fetchedChainId) === Number(chainId)
    result.isValid = isValidChainId
    result.error = isValidChainId
      ? ''
      : 'Incorrect combination of chain Id and RPC URL'
  } catch (e) {
    result.isValid = false
    result.error = 'Invalid RPC URL'
  }
  return result
}

async function validateAddNetworkParams(networkInfo) {
  let result: { isValid: boolean; error: unknown } = {
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
  } else {
    result = await validateRPCandChainID(
      networkInfo.rpcUrls[0],
      networkInfo.chainId
    )
  }
  return result
}

async function validateAddTokensParams(params) {
  return await validatePopulateContractForToken({
    walletAddress: userStore.walletAddress,
    chainId: rpcStore.selectedRpcConfig?.chainId,
    tokenContract: params,
    isEthereumMainnet: rpcStore.isEthereumMainnet,
  })
}

async function validateAddNftParams(tokenType, params) {
  return await validatePopulateContractForNft({
    walletAddress: userStore.walletAddress,
    chainId: rpcStore.selectedRpcConfig?.chainId,
    nftContract: { type: tokenType, ...params },
    isEthereumMainnet: rpcStore.isEthereumMainnet,
  })
}

async function addNetwork(request, keeper) {
  const { method, params } = request
  const networkInfo = params[0]
  const name: string = networkInfo.chainName || ''
  const rpcUrls: string[] = networkInfo.rpcUrls || []
  const chainId = `${Number(networkInfo.chainId)}`
  const symbol: string = networkInfo.nativeCurrency.symbol || ''
  const existingChain = isExistingChain(chainId)
  if (existingChain) {
    rpcStore.setRpcConfig({
      ...existingChain,
      rpcUrls,
    })
    rpcStore.setSelectedChainId(existingChain.chainId)
    await getRequestHandler().setRpcConfig({
      ...existingChain,
      chainId: Number(existingChain.chainId),
    })
  } else {
    const payload = {
      chainName: name,
      chainId,
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
    rpcStore.setSelectedChainId(payload.chainId)
    await getRequestHandler().setRpcConfig({
      ...payload,
      chainId: Number(payload.chainId),
    })
  }
  if (!reqStore.areRequestsPendingForApproval) {
    router.push({ name: 'home' })
  }

  keeper.reply(method, {
    result: `Added the network ${networkInfo.chainName}`,
    id: request.id,
  })
}

async function addToken(request, keeper) {
  const params = request.params.options
  const ercType = request.params.type?.toLowerCase()
  const storage = getStorage()
  if (ercType === 'erc20') {
    const { tokenContract } = await validateAddTokensParams(params)
    const assetContractsString = storage.local.getItem(
      `${userStore.walletAddress}/${rpcStore.selectedRpcConfig?.chainId}/asset-contracts`
    )
    let assetContracts: AssetContract[] = []
    if (assetContractsString) {
      assetContracts = JSON.parse(assetContractsString) as AssetContract[]
    }
    assetContracts.push({ ...tokenContract })
    storage.local.setItem(
      `${userStore.walletAddress}/${rpcStore.selectedRpcConfig?.chainId}/asset-contracts`,
      JSON.stringify(assetContracts)
    )
    keeper.reply(request.method, {
      result: 'Token Added successfully',
      id: request.id,
    })
  } else if (ercType === 'erc721' || ercType === 'erc1155') {
    const { nft } = await validateAddNftParams(ercType, params)
    const nftDB = await NFTDB.create(
      getStorage().local,
      userStore.walletAddress
    )
    nftDB.addNFT(nft, Number(rpcStore.selectedChainId))
    keeper.reply(request.method, {
      result: 'Token Added successfully',
      id: request.id,
    })
  }
}

async function processRequest({ request, isPermissionGranted }, keeper) {
  if (isPermissionGranted) {
    if (
      request.method === 'wallet_switchEthereumChain' ||
      request.method === 'wallet_addEthereumChain' ||
      request.method === 'wallet_watchAsset'
    ) {
      const { method } = request
      if (method === 'wallet_switchEthereumChain') switchChain(request, keeper)
      if (method === 'wallet_addEthereumChain') addNetwork(request, keeper)
      if (method === 'wallet_watchAsset') addToken(request, keeper)
    } else {
      if (request.method === 'eth_sendTransaction') {
        request.params[0].gasLimit =
          request.params[0].gas || request.params[0].gasLimit
        delete request.params[0].gas
      }
      try {
        const response = await keeper.request(request)
        await keeper.reply(request.method, response)
        if (response.error) {
          if (response.error.data?.originalError) {
            await showToast(
              'error',
              response.error.data.originalError?.error?.message ||
                response.error.data.originalError?.code ||
                'Something went wrong. Please try again'
            )
          } else {
            await showToast('error', response.error)
          }
          return
        } else {
          const asyncMethods = [
            'eth_sendTransaction',
            'wallet_watchAsset',
            'wallet_switchEthereumChain',
            'wallet_addEthereumChain',
          ]
          if (asyncMethods.includes(request.method)) {
            const message = `${request.method} execution completed`
            await showToast('success', message)
          }
        }
        if (request.method === 'eth_signTypedData_v4' && request.params[1]) {
          const params = JSON.parse(request.params[1])
          if (params.domain.name === 'Arcana Forwarder') {
            await activitiesStore.saveFileActivity(
              rpcStore.selectedRpcConfig?.chainId,
              params.message,
              params.domain.verifyingContract
            )
          }
        }
        if (request.method === 'eth_sendTransaction' && response.result) {
          await activitiesStore.fetchAndSaveActivityFromHash({
            txHash: response.result,
            chainId: rpcStore.selectedRpcConfig?.chainId,
          })
        }
      } catch (err) {
        console.error({ err })
      }
    }
  } else {
    await keeper.reply(request.method, {
      jsonrpc: '2.0',
      error: 'user_deny',
      result: null,
      id: request.id,
    })
  }
}

async function handleRequest(request, requestStore, appStore, keeper) {
  if (request.method === 'wallet_addEthereumChain') {
    const validationResponse = await validateAddNetworkParams(request.params[0])
    if (!validationResponse.isValid) {
      await keeper.reply(request.method, {
        jsonrpc: '2.0',
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
      await keeper.reply(request.method, {
        jsonrpc: '2.0',
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
      rpcStore.selectedRPCConfig?.chainId &&
      parseInt(params.domain.chainId) !==
        parseInt(rpcStore.selectedRPCConfig.chainId)
    ) {
      error = `domain chain ID ${params.domain.chainId} does not match network chain id ${rpcStore.selectedRPCConfig?.chainId}`
    }
    if (error) {
      await keeper.reply(request.method, {
        jsonrpc: '2.0',
        error,
        result: null,
        id: request.id,
      })
      return
    }
  }
  if (request.method === 'wallet_watchAsset') {
    const tokenType: string = request.params.type?.toLowerCase()
    const params = request.params.options
    if (tokenType === 'erc20') {
      const validationResponse = await validateAddTokensParams(params)
      if (!validationResponse.isValid) {
        await keeper.reply(request.method, {
          jsonrpc: '2.0',
          error: validationResponse.error,
          result: null,
          id: request.id,
        })
        return
      }
    } else if (tokenType === 'erc721' || tokenType === 'erc1155') {
      const validationResponse = await validateAddNftParams(tokenType, params)
      if (!validationResponse.isValid) {
        await keeper.reply(request.method, {
          jsonrpc: '2.0',
          error: validationResponse.error,
          result: null,
          id: request.id,
        })
        return
      }
    } else {
      return keeper.reply(request.method, {
        jsonrpc: '2.0',
        id: request.id,
        result: null,
        error: `Asset of type '${request.params.type}' not supported`,
      })
    }
  }
  const isPermissionRequired = requirePermission(request, appStore.validAppMode)
  if (isPermissionRequired) {
    if (appStore.sdkVersion === 'v3') {
      console.log('appStore.expandWallet', appStore.expandWallet)
      if (!appStore.expandWallet) {
        appStore.expandedByRequest = true
      }
      console.log('appStore.expandedByRequest', appStore.expandedByRequest)
      appStore.expandWallet = true
      appStore.compactMode = isPermissionRequired
    } else {
      const connectionInstance = await keeper.connection.promise
      connectionInstance.openPopup()
    }
  }

  requestStore.addRequests(request, isPermissionRequired, new Date())
}

export { getSendRequestFn, watchRequestQueue, handleRequest }
