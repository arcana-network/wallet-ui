/* eslint-disable @typescript-eslint/ban-ts-comment */

import { AuthProvider } from '@arcana/auth-core'
import type { InitParams } from '@arcana/auth-core/types/types'

import { useAppStore } from '@/store/app'
import { AUTH_URL, GATEWAY_URL, DKG } from '@/utils/constants'
import { getStorage, StorageType } from '@/utils/storageWrapper'

const AUTH_NETWORK = process.env
  .VUE_APP_ARCANA_AUTH_NETWORK as InitParams['network']

const network =
  AUTH_NETWORK === 'dev'
    ? {
        signatureUrl: 'https://oauth.arcana.network/oauth',
        gatewayUrl: GATEWAY_URL,
        passwordlessUrl: 'https://passwordless.dev.arcana.network',
        dkgContractAddress: DKG.CONTRACT_ADDRESS,
        dkgProviderUrl: DKG.RPC_URL,
      }
    : AUTH_NETWORK

let authProvider: AuthProvider | null = null

async function getAuthProvider(
  appId: string,
  shouldVerifyState = false,
  autoClean = true
): Promise<AuthProvider> {
  if (!authProvider) {
    const stor = getStorage()

    const params: InitParams = {
      appId: appId,
      redirectUri: `${AUTH_URL}/verify/${appId}/`,
      // @ts-ignore
      network,
      flow: 'redirect',
      autoRedirect: false,
      debug: true,
      shouldVerifyState,
      useInMemoryStore: stor.local.storageType === StorageType.IN_MEMORY,
    }
    if (!autoClean) {
      authProvider = new AuthProvider({
        ...params,
        // @ts-ignore
        revokeTokenPostLogin: false,
      })
      // @ts-ignore
      await authProvider.init()
    } else {
      authProvider = await AuthProvider.init(params)
    }
    const appStore = useAppStore()
    // TODO find a comprehensive solution to this
    // @ts-ignore
    appStore.isMfaEnabled = authProvider.appConfig.mfa_enabled !== false
  }
  // authProvider.shouldVerifyState = shouldVerifyState
  return authProvider
}

export { getAuthProvider }
