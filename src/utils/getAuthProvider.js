import { AuthProvider } from "@arcana/auth";

export function getAuthProvider(appId) {
  return new AuthProvider({
    appId: appId,
    redirectUri: `${window.location.origin}/redirect`,
    network: "dev",
    uxMode: "popup",
  });
}
