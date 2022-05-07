import { AuthProvider } from '@arcana/auth'
import type { InitParams } from '@arcana/auth/types/types'

const AUTH_NETWORK = process.env
  .VUE_APP_ARCANA_AUTH_NETWORK as InitParams['network']

export function getAuthProvider(appId: string): AuthProvider {
  return new AuthProvider({
    appId: appId,
    redirectUri: `https://wallet-verify.netlify.app/verify/${appId}/`,
    network: AUTH_NETWORK,
    flow: 'redirect',
    autoRedirect: false,
    debug: false,
  })
}
