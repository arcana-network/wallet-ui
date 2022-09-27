// Todo: Find a better place for these functions
import { requirePermission } from '@/models/Connection'
import { useActivitiesStore } from '@/store/activities'
import { useRpcStore } from '@/store/rpc'

const ARCANA_CHAIN = [40404]

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
    console.log('method', request, response)
    if (request.method === 'eth_signTypedData_v4' && request.params[1]) {
      const activitiesStore = useActivitiesStore()
      const rpcStore = useRpcStore()
      if (ARCANA_CHAIN.includes(rpcStore.rpcConfig?.chainId as number)) {
        const params = JSON.parse(request.params[1])
        activitiesStore.saveFileActivity(
          rpcStore.rpcConfig?.chainId as number,
          params.message.data
        )
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
