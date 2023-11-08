/* eslint-disable @typescript-eslint/ban-ts-comment */

import { AuthProvider, CURVE } from '@arcana/auth-core'
import type { InitParams } from '@arcana/auth-core/types/types'

import { useAppStore } from '@/store/app'
import { AUTH_URL } from '@/utils/constants'
import { getStorage, StorageType } from '@/utils/storageWrapper'

const AUTH_NETWORK = process.env
  .VUE_APP_ARCANA_AUTH_NETWORK as InitParams['network']

let authProvider: AuthProvider | null = null

async function getAuthProvider(
  appId: string,
  shouldVerifyState = false,
  autoClean = true
): Promise<AuthProvider> {
  if (!authProvider) {
    const appStore = useAppStore()
    const stor = getStorage()

    const params: InitParams = {
      appId: appId,
      redirectUri: `${AUTH_URL}/verify/${appId}/`,
      // @ts-ignore
      network: AUTH_NETWORK,
      flow: 'redirect',
      autoRedirect: false,
      debug: true,
      shouldVerifyState,
      useInMemoryStore: stor.local.storageType === StorageType.IN_MEMORY,
      curve: appStore.curve,
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
    // TODO find a comprehensive solution to this
    // @ts-ignore
    appStore.isMfaEnabled = authProvider.appConfig.mfa_enabled !== false
    // @ts-ignore
    console.log(authProvider.appConfig)
    appStore.setChainType(
      //@ts-ignore
      authProvider.appConfig.chain_type?.toLowerCase() || 'evm'
    )
  }
  // authProvider.shouldVerifyState = shouldVerifyState
  return authProvider
}

export { getAuthProvider }
