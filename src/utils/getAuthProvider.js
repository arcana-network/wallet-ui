import { AuthProvider } from "@arcana/auth";

export function getAuthProvider(appId) {
  return new AuthProvider({
    appID: appId,
    redirectUri: `${window.location.origin}/login`,
    network: "testnet",
    uxMode: "popup",
  });
}
