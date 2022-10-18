// Todo: Find a better place for these functions
import { useToast } from 'vue-toastification'

import { requirePermission } from '@/models/Connection'
import { store } from '@/store'
import { useActivitiesStore } from '@/store/activities'
import { useRpcStore } from '@/store/rpc'

const activitiesStore = useActivitiesStore(store)
const rpcStore = useRpcStore(store)
const toast = useToast()

function getSendRequestFn(handleRequest, requestStore, appStore) {
  return function sendRequest(request) {
    return handleRequest(request, requestStore, appStore)
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

async function processRequest({ request, isPermissionGranted }, keeper) {
  keeper.setRpcConfig(rpcStore.selectedRpcConfig)
  if (isPermissionGranted) {
    if (request.method === 'eth_sendTransaction') {
      request.params[0].gasLimit = request.params[0].gas
      delete request.params[0].gas
    }
    try {
      const response = await keeper.request(request)
      keeper.reply(request.method, response)
      if (response.error) {
        console.log(response.error)
        toast.error(response.error.data.originalError.code)
        return
      }
      if (request.method === 'eth_signTypedData_v4' && request.params[1]) {
        const params = JSON.parse(request.params[1])
        if (params.domain.name === 'Arcana Forwarder') {
          activitiesStore.saveFileActivity(
            rpcStore.selectedRpcConfig?.chainId as number,
            params.message.data
          )
        }
        return
      }
      if (request.method === 'eth_sendTransaction' && response.result) {
        activitiesStore.fetchAndSaveActivityFromHash({
          txHash: response.result,
          chainId: rpcStore.selectedRpcConfig?.chainId as number,
        })
      }
    } catch (error) {
      console.error({ error })
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
