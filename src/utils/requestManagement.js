// Todo: Find a better place for these functions

export function getSendRequestFn(handleRequest, keeper, router, requestStore) {
  return function sendRequest(request) {
    return handleRequest(request, keeper, router, requestStore);
  };
}

function watchPermissionStatus(store) {
  return new Promise((resolve) => {
    store.$subscribe((mutation, state) => {
      if (state.permissionStatus !== "none") {
        resolve(state.permissionStatus);
      }
    });
  });
}

export async function handleRequest(request, keeper, router, requestStore) {
  const isPermissionRequired = keeper.isPermissionRequired(request.method);
  requestStore.setRequest(request, isPermissionRequired);
  if (isPermissionRequired) {
    router.push({
      name: "signMessage",
      params: {
        reqId: request.id,
      },
    });
    await watchPermissionStatus(requestStore);
  }
  if (requestStore.allowRequest) {
    const response = await keeper.handleRequest(request);
    keeper.reply(request.method, response);
  } else {
    keeper.reply(request.method, {
      error: "user_deny",
      result: null,
      id: request.id,
    });
  }
}
