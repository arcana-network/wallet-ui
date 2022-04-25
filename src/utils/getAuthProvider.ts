import { AuthProvider } from '@arcana/auth'
import type { InitParams } from '@arcana/auth/types/types'

export function getAuthProvider(appId): AuthProvider {
  return new AuthProvider({
    appId: appId,
    redirectUri: `${window.location.origin}/redirect`,
    network: process.env.VUE_APP_ARCANA_AUTH_NETWORK,
    uxMode: 'popup',
    debug: false,
  } as InitParams)
}
