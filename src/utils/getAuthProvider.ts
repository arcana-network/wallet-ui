import { AuthProvider } from '@arcana/auth'

export function getAuthProvider(appId) {
  return new AuthProvider({
    appId: appId,
    redirectUri: `${window.location.origin}/redirect`,
    network: process.env.VUE_APP_ARCANA_AUTH_NETWORK,
    uxMode: 'popup',
  })
}
