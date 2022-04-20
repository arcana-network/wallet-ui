// Todo: Find a better place for these functions

function getSendRequestFn(handleRequest, keeper, router, requestStore) {
  return function sendRequest(request) {
    return handleRequest(request, keeper, router, requestStore)
  }
}

function watchRequestQueue(store, keeper) {
  store.$subscribe((mutation, state) => {
    const { processQueue } = state
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

async function handleRequest(request, keeper, router, requestStore) {
  const isPermissionRequired = keeper.isPermissionRequired(request.method)
  requestStore.addRequests(request, isPermissionRequired)
}

export { getSendRequestFn, watchRequestQueue, handleRequest }
