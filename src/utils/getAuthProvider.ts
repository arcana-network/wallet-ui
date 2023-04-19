import { AuthProvider } from '@arcana/auth-core'
import type { InitParams } from '@arcana/auth-core/types/types'

const AUTH_NETWORK = process.env
  .VUE_APP_ARCANA_AUTH_NETWORK as InitParams['network']

const REDIRECT_URL = process.env.VUE_APP_WALLET_AUTH_REDIRECT_URL

let authProvider: AuthProvider | null = null

export async function getAuthProvider(appId: string): Promise<AuthProvider> {
  if (!authProvider) {
    authProvider = await AuthProvider.init({
      appId: appId,
      redirectUri: `${REDIRECT_URL}/${appId}/`,
      network: AUTH_NETWORK,
      flow: 'redirect',
      autoRedirect: false,
      debug: true,
    })
  }
  return authProvider
}
