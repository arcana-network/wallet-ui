import { AuthProvider } from '@arcana/auth-core'
import type { InitParams } from '@arcana/auth-core/types/types'

import { useAppStore } from '@/store/app'
import { AUTH_URL } from '@/utils/constants'
import { getStorage, StorageType } from '@/utils/storageWrapper'

const AUTH_NETWORK = process.env
  .VUE_APP_ARCANA_AUTH_NETWORK as InitParams['network']

let authProvider: AuthProvider | null = null

export async function getAuthProvider(
  appId: string,
  shouldVerifyState = false
): Promise<AuthProvider> {
  if (!authProvider) {
    const stor = getStorage()

    authProvider = await AuthProvider.init({
      appId: appId,
      redirectUri: `${AUTH_URL}/verify/${appId}/`,
      network: AUTH_NETWORK,
      flow: 'redirect',
      autoRedirect: false,
      debug: true,
      shouldVerifyState,
      useInMemoryStore: stor.local.storageType === StorageType.IN_MEMORY,
    })
    const appStore = useAppStore()
    // TODO find a comprehensive solution to this
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    appStore.isMfaEnabled = authProvider.appConfig.mfa_enabled !== false
  }
  // authProvider.shouldVerifyState = shouldVerifyState
  return authProvider
}
