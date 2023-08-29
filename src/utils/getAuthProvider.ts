import { AuthProvider } from '@arcana/auth-core'
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
    const stor = getStorage()

    const params: InitParams = {
      appId: appId,
      redirectUri: `${AUTH_URL}/verify/${appId}/`,
      network: AUTH_NETWORK,
      flow: 'redirect',
      autoRedirect: false,
      debug: true,
      shouldVerifyState,
      useInMemoryStore: stor.local.storageType === StorageType.IN_MEMORY,
    }
    if (!autoClean) {
      authProvider = new AuthProvider({
        ...params,
        revokeTokenPostLogin: false,
      })
      await authProvider.init()
    } else {
      authProvider = await AuthProvider.init(params)
    }
    const appStore = useAppStore()
    // TODO find a comprehensive solution to this
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    appStore.isMfaEnabled = authProvider.appConfig.mfa_enabled !== false
  }
  // authProvider.shouldVerifyState = shouldVerifyState
  return authProvider
}

export { getAuthProvider }
