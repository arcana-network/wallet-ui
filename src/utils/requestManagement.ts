// Todo: Find a better place for these functions
import { requirePermission } from '@/models/Connection'

function getSendRequestFn(handleRequest, keeper, router, requestStore) {
  return function sendRequest(request) {
    return handleRequest(request, keeper, router, requestStore)
  }
}

function watchRequestQueue(store, keeper) {
  store.$subscribe((_, state) => {
    const { processQueue, pendingRequests } = state
    const pendingRequestCount = Object.values(pendingRequests).length
    keeper.connection.sendPendingRequestCount(pendingRequestCount)
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

async function handleRequest(request, requestStore) {
  const isPermissionRequired = requirePermission(request)
  requestStore.addRequests(request, isPermissionRequired, new Date())
}

export { getSendRequestFn, watchRequestQueue, handleRequest }
