export function isLoggedIn() {
  return false;
}

export function getSendRequestFn(isLoggedIn) {
  return function sendRequest(request) {
    if (!isLoggedIn()) {
      return { message: "Not authorized" };
    }
    console.log("request:", request);
  };
}
