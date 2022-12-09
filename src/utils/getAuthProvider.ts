import { AuthProvider } from '@arcana/auth-core'
import type { InitParams } from '@arcana/auth-core/types/types'

const AUTH_NETWORK = process.env
  .VUE_APP_ARCANA_AUTH_NETWORK as InitParams['network']

const REDIRECT_URL = process.env.VUE_APP_WALLET_AUTH_REDIRECT_URL

let authProvider: AuthProvider | null = null

const getV2RedirectUrl = (redirectUrl: string, appId: string) => {
  const oldUrl = new URL(redirectUrl)

  const url = new URL(`/login/verify/${appId}/`, oldUrl.origin)
  return url.toString()
}

export async function getAuthProvider(
  appId: string,
  v2 = false
): Promise<AuthProvider> {
  const redirectUrl = v2
    ? getV2RedirectUrl(REDIRECT_URL, appId)
    : `${REDIRECT_URL}/${appId}/`
  if (!authProvider) {
    authProvider = await AuthProvider.init({
      appId: appId,
      redirectUri: redirectUrl,
      network: AUTH_NETWORK,
      flow: 'redirect',
      autoRedirect: false,
      debug: true,
    })
  }
  return authProvider
}
