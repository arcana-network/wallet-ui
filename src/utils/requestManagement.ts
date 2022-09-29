// Todo: Find a better place for these functions
import { requirePermission } from '@/models/Connection'
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

async function watchRequestQueue(store, keeper) {
  const connectionInstance = await keeper.connection.promise
  store.$subscribe((_, state) => {
    const { processQueue, pendingRequests } = state
    const pendingRequestCount = Object.values(pendingRequests).length
    connectionInstance.sendPendingRequestCount(pendingRequestCount)
    while (processQueue.length > 0) {
      const request = processQueue.shift()
      processRequest(request, keeper)
    }
  })
}

async function processRequest({ request, isPermissionGranted }, keeper) {
  if (isPermissionGranted) {
    const response = await keeper.handleRequest(request)
    keeper.reply(request.method, response)
    if (request.method === 'eth_signTypedData_v4' && request.params[1]) {
      const params = JSON.parse(request.params[1])
      if (params.domain.name === 'Arcana Forwarder') {
        activitiesStore.saveFileActivity(
          rpcStore.rpcConfig?.chainId as number,
          params.message.data
        )
      }
    }
    if (request.method === 'eth_sendTransaction' && response.result) {
      activitiesStore.fetchAndSaveActivityFromHash({
        txHash: response.result,
        chainId: rpcStore.rpcConfig?.chainId as number,
      })
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
