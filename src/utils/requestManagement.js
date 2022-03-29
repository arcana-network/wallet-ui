// Todo: Find a better place for these functions

export function getSendRequestFn(handleRequest, keeper) {
  return function sendRequest(request) {
    return handleRequest(request, keeper);
  };
}

export function handleRequest(request, keeper) {
  if (keeper.isPermissionRequired(request.method)) {
    console.log("permission required");
  } else {
    console.log("permission not required");
  }
}
