// Todo: Find a better place for these functions
import { requirePermission } from '@/models/Connection'
import { router } from '@/routes'
import { store } from '@/store'
import { useActivitiesStore } from '@/store/activities'
import { useRpcStore } from '@/store/rpc'

const activitiesStore = useActivitiesStore(store)
const rpcStore = useRpcStore(store)

function getSendRequestFn(handleRequest, requestStore, appStore) {
  return function sendRequest(request) {
    return handleRequest(request, requestStore, appStore)
  }
}

function watchRequestQueue(reqStore, keeper) {
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
    }
  })
}

function switchChain(request, keeper) {
  const { chainId } = request.params[0]
  const rpcConfigs = rpcStore.rpcConfigs
  if (rpcConfigs && rpcConfigs[chainId]) {
    rpcStore.setSelectedChainId(Number(chainId))
    keeper.reply(request.method, {
      result: `Chain changed to ${rpcConfigs[chainId].chainName}`,
      id: request.id,
    })
    router.push({ name: 'home' })
  } else {
    keeper.reply(request.method, {
      result: `Chain Id ${chainId} is not in the list`,
      id: request.id,
    })
  }
}

async function processRequest({ request, isPermissionGranted }, keeper) {
  if (isPermissionGranted) {
    if (request.method === 'wallet_switchEthereumChain') {
      switchChain(request, keeper)
    } else {
      const response = await keeper.request(request)
      keeper.reply(request.method, response)
      if (request.method === 'eth_signTypedData_v4' && request.params[1]) {
        const params = JSON.parse(request.params[1])
        if (params.domain.name === 'Arcana Forwarder') {
          activitiesStore.saveFileActivity(
            rpcStore.selectedRpcConfig?.chainId as number,
            params.message.data
          )
        }
      }
      if (request.method === 'eth_sendTransaction' && response.result) {
        activitiesStore.fetchAndSaveActivityFromHash({
          txHash: response.result,
          chainId: rpcStore.selectedRpcConfig?.chainId as number,
        })
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

async function handleRequest(request, requestStore, appStore) {
  const isPermissionRequired = requirePermission(request, appStore.validAppMode)
  requestStore.addRequests(request, isPermissionRequired, new Date())
}

export { getSendRequestFn, watchRequestQueue, handleRequest }
