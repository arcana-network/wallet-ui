// Todo: Find a better place for these functions

export function getSendRequestFn(handleRequest, keeper, router) {
  return function sendRequest(request) {
    return handleRequest(request, keeper, router);
  };
}

export function handleRequest(request, keeper) {
  const response = keeper.handleRequest(request);
  keeper.reply(request.method, response);
}
