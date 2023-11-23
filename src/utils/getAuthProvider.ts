/* eslint-disable @typescript-eslint/ban-ts-comment */

import { AuthProvider } from '@arcana/auth-core'
import type { InitParams } from '@arcana/auth-core/types/types'

import { useAppStore } from '@/store/app'
import { AUTH_URL } from '@/utils/constants'
import { getStorage, StorageType } from '@/utils/storageWrapper'

const AUTH_NETWORK = process.env
  .VUE_APP_ARCANA_AUTH_NETWORK as InitParams['network']

let authProvider: AuthProvider | null = null

const getDefaultParams = () => {
  const params: Omit<InitParams, 'appId'> = {
    // @ts-ignore
    network: AUTH_NETWORK,
    autoRedirect: false,
    debug: true,
    shouldVerifyState: false,
    // useInMemoryStore: stor.local.storageType === StorageType.IN_MEMORY,
    revokeTokenPostLogin: false,
  }
  return params
}

async function getAuthProvider(
  appId: string,
  autoClean = true
): Promise<AuthProvider> {
  if (!authProvider) {
    const appStore = useAppStore()
    const params = getDefaultParams()
    const stor = getStorage()

    if (!autoClean) {
      authProvider = new AuthProvider({
        ...params,
        redirectUri: `${AUTH_URL}/verify/${appId}/`,
        autoRedirect: false,
        appId,
        revokeTokenPostLogin: false,
        curve: appStore.curve,
        useInMemoryStore: stor.local.storageType === StorageType.IN_MEMORY,
      })
      await authProvider.init()
    } else {
      authProvider = await AuthProvider.init({
        ...params,
        redirectUri: `${AUTH_URL}/verify/${appId}/`,
        autoRedirect: false,
        appId,
        curve: appStore.curve,
        useInMemoryStore: stor.local.storageType === StorageType.IN_MEMORY,
      })
    }
    // TODO find a comprehensive solution to this
    // @ts-ignore
    appStore.isMfaEnabled = authProvider.appConfig.mfa_enabled !== false
    appStore.setChainType(
      //@ts-ignore
      authProvider.appConfig.chain_type?.toLowerCase() || 'evm'
    )
  }
  // authProvider.shouldVerifyState = shouldVerifyState
  return authProvider
}

export { getAuthProvider, getDefaultParams }
