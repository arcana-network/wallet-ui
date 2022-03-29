// Todo: Find a better place for these functions

export function getSendRequestFn(handleRequest) {
  return function sendRequest(request) {
    return handleRequest(request);
  };
}

export function handleRequest(request) {
  console.log("request", request);
  return { message: "request received" };
}
