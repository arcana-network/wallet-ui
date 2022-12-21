// Todo: Find a better place for these functions
import { AppMode } from '@arcana/auth'
import { ethErrors, serializeError } from 'eth-rpc-errors'
import { watch } from 'vue'
import { useToast } from 'vue-toastification'

import type { AssetContract } from '@/models/Asset'
import { requirePermission } from '@/models/Connection'
import { NFT } from '@/models/NFT'
import { router } from '@/routes'
import { store } from '@/store'
import { useActivitiesStore } from '@/store/activities'
import { useRequestStore } from '@/store/request'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import validatePopulateContractForNft from '@/utils/validateAndPopulateContractForNft'
import validatePopulateContractForToken from '@/utils/validateAndPopulateContractForToken'

const activitiesStore = useActivitiesStore(store)
const rpcStore = useRpcStore(store)
const userStore = useUserStore(store)
const toast = useToast()
const reqStore = useRequestStore()

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
      try {
        connectionInstance.sendPendingRequestCount(pendingRequestCount)
      } catch (err) {
        console.error({ err })
      }
      if (processQueue.length > 0) {
        const request = processQueue.shift()
        if (request) processRequest(request, keeper)
        if (appMode === AppMode.Widget && pendingRequestCount === 0) {
          connectionInstance.closePopup()
        }
        try {
          connectionInstance.sendPendingRequestCount(pendingRequestCount)
        } catch (err) {
          console.error({ err })
        }
      }
    },
    { deep: true }
  )
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

async function validateAddTokensParams(params) {
  return await validatePopulateContractForToken({
    walletAddress: userStore.walletAddress,
    chainId: rpcStore.selectedRpcConfig.chainId,
    tokenContract: params,
    isEthereumMainnet: rpcStore.isEthereumMainnet,
  })
}

async function validateAddNftParams(tokenType, params) {
  return await validatePopulateContractForNft({
    walletAddress: userStore.walletAddress,
    chainId: rpcStore.selectedRpcConfig.chainId,
    nftContract: { type: tokenType, ...params },
    isEthereumMainnet: rpcStore.isEthereumMainnet,
  })
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

async function addToken(request, keeper) {
  const params = request.params.options
  const ercType = request.params.type?.toLowerCase()
  if (ercType === 'erc20') {
    const { tokenContract } = await validateAddTokensParams(params)
    const assetContractsString = localStorage.getItem(
      `${userStore.walletAddress}/${rpcStore.selectedRpcConfig?.chainId}/asset-contracts`
    )
    let assetContracts: AssetContract[] = []
    if (assetContractsString) {
      assetContracts = JSON.parse(assetContractsString) as AssetContract[]
    }
    assetContracts.push({ ...tokenContract })
    localStorage.setItem(
      `${userStore.walletAddress}/${rpcStore.selectedRpcConfig?.chainId}/asset-contracts`,
      JSON.stringify(assetContracts)
    )
    keeper.reply(request.method, {
      result: 'Token Added successfully',
      id: request.id,
    })
  } else if (ercType === 'erc721' || ercType === 'erc1155') {
    const { nft } = await validateAddNftParams(ercType, params)
    const nftsString = localStorage.getItem(
      `${userStore.walletAddress}/${rpcStore.selectedRpcConfig?.chainId}/nfts`
    )
    let nfts: NFT[] = []
    if (nftsString) {
      nfts = JSON.parse(nftsString) as NFT[]
    }
    nfts.push({ ...nft })
    nfts.sort((nft1, nft2) => {
      if (nft1.tokenId > nft2.tokenId) {
        return 1
      }
      if (nft2.tokenId > nft1.tokenId) {
        return -1
      }
      return 0
    })
    nfts.sort((nft1, nft2) => {
      if (nft1.collectionName > nft2.collectionName) {
        return 1
      }
      if (nft2.collectionName > nft1.collectionName) {
        return -1
      }
      return 0
    })
    localStorage.setItem(
      `${userStore.walletAddress}/${rpcStore.selectedRpcConfig?.chainId}/nfts`,
      JSON.stringify(nfts)
    )
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
    if (error) {
      keeper.reply(request.method, {
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
        keeper.reply(request.method, {
          error: validationResponse.error,
          result: null,
          id: request.id,
        })
        return
      }
    } else if (tokenType === 'erc721' || tokenType === 'erc1155') {
      const validationResponse = await validateAddNftParams(tokenType, params)
      if (!validationResponse.isValid) {
        keeper.reply(request.method, {
          error: validationResponse.error,
          result: null,
          id: request.id,
        })
        return
      }
    } else {
      return keeper.reply(request.method, {
        id: request.id,
        result: null,
        error: `Asset of type '${request.params.type}' not supported`,
      })
    }
  }
  const isPermissionRequired = requirePermission(request, appStore.validAppMode)
  requestStore.addRequests(request, isPermissionRequired, new Date())
}

export { getSendRequestFn, watchRequestQueue, handleRequest }
