import { AuthProvider } from '@arcana/auth'
import type { InitParams } from '@arcana/auth/types/types'

const AUTH_NETWORK = import.meta.env
  .VITE_ARCANA_AUTH_NETWORK as InitParams['network']

export function getAuthProvider(appId): AuthProvider {
  return new AuthProvider({
    appId: appId,
    redirectUri: `${window.location.origin}/redirect`,
    network: AUTH_NETWORK,
    uxMode: 'popup',
    debug: false,
  })
}
