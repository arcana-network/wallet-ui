import { AppMode } from '@arcana/auth'
import { ethErrors, serializeError } from 'eth-rpc-errors'
import { ethers } from 'ethers'
import { watch } from 'vue'
import { useToast } from 'vue-toastification'

import {
  PERMISSIONS,
  requirePermission,
  UNSUPPORTED_METHODS,
} from '@/models/Connection'
import { router } from '@/routes'
import { NFTDB } from '@/services/nft.service'
import { store } from '@/store'
import { useActivitiesStore } from '@/store/activities'
import { useAppStore } from '@/store/app'
import { useRequestStore } from '@/store/request'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import { ChainType } from '@/utils/chainType'
import { TOAST_TIME_OUT } from '@/utils/constants'
import { errors } from '@/utils/content'
import { getRequestHandler } from '@/utils/requestHandlerSingleton'
import { sanitizeRequest } from '@/utils/sanitizeRequest'
import { getStorage } from '@/utils/storageWrapper'
import validatePopulateContractForNft from '@/utils/validateAndPopulateContractForNft'
import validatePopulateContractForToken from '@/utils/validateAndPopulateContractForToken'

const activitiesStore = useActivitiesStore(store)
const rpcStore = useRpcStore(store)
const userStore = useUserStore(store)
const toast = useToast()
const reqStore = useRequestStore(store)
const appStore = useAppStore(store)

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
  return function sendRequest(request, requestOrigin) {
    if (requestOrigin !== 'auth-verify') {
      return handleRequest(request, requestStore, appStore, keeper)
    }
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
          (appMode === AppMode.Widget || appStore.expandedByRequest) &&
          !pendingRequestCount &&
          appStore.sdkVersion !== 'v3'
        ) {
          appStore.expandedByRequest = false
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
  const result: { isValid: boolean; error: unknown } = {
    isValid: false,
    error: null,
  }
  if (!chainId) {
    result.error = 'Please provide chain id'
  } else if (!isExistingChain(chainId)) {
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
    result.error = isValidChainId ? '' : errors.RPC.ERROR
  } catch (e) {
    result.isValid = false
    result.error = errors.RPC.INVALID
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
  const name: string = networkInfo.chainName
  const rpcUrls: string[] = networkInfo.rpcUrls
  const chainId = `${Number(networkInfo.chainId)}`
  const symbol: string = networkInfo.nativeCurrency.symbol || ''
  const existingChain = isExistingChain(chainId)
  const favicon = networkInfo.iconUrls?.length
    ? networkInfo.iconUrls[0]
    : undefined
  if (existingChain) {
    rpcStore.setRpcConfig({
      ...existingChain,
      rpcUrls: rpcUrls || existingChain.rpcUrls,
      favicon: favicon || existingChain.favicon,
      blockExplorerUrls:
        networkInfo.blockExplorerUrls || existingChain.blockExplorerUrls,
      chainName: name || existingChain.chainName,
    })
    rpcStore.setSelectedChainId(existingChain.chainId as string)
    await getRequestHandler().setRpcConfig({
      ...existingChain,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      chainId: Number(existingChain.chainId),
    })
  } else {
    const payload = {
      chainName: name || '',
      chainId,
      blockExplorerUrls: networkInfo.blockExplorerUrls || [],
      rpcUrls: rpcUrls || [],
      favicon,
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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
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
  const ercType = request.params.type?.toLowerCase()
  const storage = getStorage()
  if (ercType === 'erc20') {
    const tokenContract = request.token
    const assetContracts = storage.local.getAssetContractList(
      userStore.walletAddress,
      Number(rpcStore.selectedRpcConfig?.chainId)
    )
    assetContracts.push({ ...tokenContract })
    storage.local.setAssetContractList(
      userStore.walletAddress,
      Number(rpcStore.selectedRpcConfig?.chainId),
      assetContracts
    )
    keeper.reply(request.method, {
      result: 'Token Added successfully',
      id: request.id,
    })
  } else if (ercType === 'erc721' || ercType === 'erc1155') {
    const nft = request.nft
    const nftDB = await NFTDB.create(
      getStorage().local,
      userStore.walletAddress,
      true
    )
    nftDB.addNFT(nft, Number(rpcStore.selectedChainId))
    keeper.reply(request.method, {
      result: 'Token Added successfully',
      id: request.id,
    })
  }
}

async function switchAccountType(request, keeper) {
  const accountType = request.params.type?.toLowerCase()
  rpcStore.setPreferredWalletAddressType(accountType)
  keeper.reply(request.method, {
    result: 'Account type changed successfully',
    id: request.id,
  })
}

async function processRequest({ request, isPermissionGranted }, keeper) {
  if (isPermissionGranted) {
    if (
      request.method === 'wallet_switchEthereumChain' ||
      request.method === 'wallet_addEthereumChain' ||
      request.method === 'wallet_watchAsset' ||
      request.method === '_arcana_switchAccountType'
    ) {
      const { method } = request
      if (method === 'wallet_switchEthereumChain') switchChain(request, keeper)
      if (method === 'wallet_addEthereumChain') addNetwork(request, keeper)
      if (method === 'wallet_watchAsset') addToken(request, keeper)
      if (method === '_arcana_switchAccountType')
        switchAccountType(request, keeper)
    } else {
      const sanitizedRequest =
        appStore.chainType === ChainType.solana_cv25519
          ? { ...request }
          : sanitizeRequest({ ...request })
      try {
        const response = await keeper.request({ ...sanitizedRequest })
        await keeper.reply(request.method, JSON.parse(JSON.stringify(response)))
        if (response.error) {
          if (response.error.code === 'INSUFFICIENT_FUNDS') {
            showToast('error', 'Insufficient Gas to make this transaction.')
          } else {
            if (response.error?.data?.originalError?.body) {
              const body = response.error?.data?.originalError?.body
              const errorBody =
                typeof body === 'string'
                  ? JSON.parse(response.error?.data?.originalError?.body)
                  : body
              if (errorBody?.error?.message) {
                showToast('error', errorBody?.error?.message)
              } else {
                showToast('error', errorBody?.error || errorBody)
              }
            } else {
              const displayError =
                ((response.error?.data?.originalError?.error?.message ||
                  response.error?.data?.originalError?.reason ||
                  response.error?.data?.originalError?.code ||
                  response.error?.error?.message ||
                  response.error?.message ||
                  response.error) as string) || 'Something went wrong'
              showToast('error', displayError)
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
          } else if (
            request.method === 'eth_sendTransaction' &&
            response.result
          ) {
            await activitiesStore.fetchAndSaveActivityFromHash({
              txHash: response.result,
              chainId: rpcStore.selectedRpcConfig?.chainId,
            })
          }
        }
        if (request.method === 'eth_signTypedData_v4' && request.params[1]) {
          const params = JSON.parse(request.params[1])
          if (params.domain.name === 'Arcana Forwarder') {
            activitiesStore.saveFileActivity(
              rpcStore.selectedRpcConfig?.chainId as string,
              params.message,
              params.domain.verifyingContract
            )
          }
        }
        if (request.method === 'eth_sendTransaction' && response.result) {
          activitiesStore.fetchAndSaveActivityFromHash({
            txHash: response.result,
            chainId: rpcStore.selectedRpcConfig?.chainId as string,
          })
        }
        if (request.method === 'signAndSendTransaction' && response.result) {
          activitiesStore.fetchAndSaveActivityFromHash({
            txHash: response.result.signature,
            chainId: rpcStore.selectedRpcConfig?.chainId as string,
            chainType: ChainType.solana_cv25519,
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
  if (UNSUPPORTED_METHODS.includes(request.method)) {
    await keeper.reply(request.method, {
      jsonrpc: '2.0',
      error: 'operation_not_supported',
      result: null,
      id: request.id,
    })
    return
  }

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
  } else if (request.method === 'wallet_switchEthereumChain') {
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
  } else if (request.method === '_arcana_switchAccountType') {
    const accountType = request.params.type?.toLowerCase()
    if (!['eoa', 'scw'].includes(accountType)) {
      return await keeper.reply(request.method, {
        jsonrpc: '2.0',
        error: 'Incorrect account type',
        result: null,
        id: request.id,
      })
    }
    if (rpcStore.preferredAddressType === accountType) {
      return await keeper.reply(request.method, {
        jsonrpc: '2.0',
        error: 'Already using the same account type',
        result: null,
        id: request.id,
      })
    }
  } else if (request.method === 'eth_signTypedData_v4') {
    const params = JSON.parse(request.params[1])
    let error: string | unknown | null = null
    if (typeof params !== 'object' || !params.domain) {
      error = getEtherInvalidParamsError('required params missing')
    } else if (
      rpcStore.selectedRPCConfig?.chainId &&
      params.domain.chainId &&
      parseInt(params.domain.chainId) !==
        parseInt(rpcStore.selectedRPCConfig.chainId as string)
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
      } else request.token = validationResponse.tokenContract
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
      } else request.nft = validationResponse.nft
    } else {
      return keeper.reply(request.method, {
        jsonrpc: '2.0',
        id: request.id,
        result: null,
        error: `Asset of type '${request.params.type}' not supported`,
      })
    }
    if (request.token || request.nft) {
      requestStore.pendingRequests[request.id] = request
    }
  }
  const isPermissionRequired = requirePermission(request, appStore.validAppMode)
  if (isPermissionRequired) {
    if (!appStore.expandWallet) {
      appStore.expandedByRequest = true
    }
    appStore.expandWallet = true
    if (appStore.sdkVersion === 'v3') {
      if (!appStore.expandWallet) {
        appStore.expandedByRequest = true
      }
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
