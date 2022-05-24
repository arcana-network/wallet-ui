// Todo: Find a better place for these functions
import { AppMode } from '@arcana/wallet'

import { requirePermission } from '@/models/Connection'

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
  } else {
    keeper.reply(request.method, {
      error: 'user_deny',
      result: null,
      id: request.id,
    })
  }
}

async function handleRequest(request, requestStore, appStore) {
  const isNoUIMode = appStore.appMode === AppMode.NoUI
  const isPermissionRequired = isNoUIMode ? false : requirePermission(request)
  requestStore.addRequests(request, isPermissionRequired, new Date())
}

export { getSendRequestFn, watchRequestQueue, handleRequest }
