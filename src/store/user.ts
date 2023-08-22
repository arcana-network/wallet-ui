import { AuthProvider, SocialLoginType } from '@arcana/auth-core'
import type { UserInfo } from '@arcana/auth-core/types/types'
import { defineStore } from 'pinia'

import { store } from '@/store'
import { getStorage } from '@/utils/storageWrapper'

type UserState = {
  isLoggedIn: boolean
  info: UserInfo
  privateKey: string
  loginType: SocialLoginType
  ownerWalletAddress: string
  scwAddress: string
  hasMfa: boolean
}

export const useUserStore = defineStore('user', {
  state: () =>
    ({
      isLoggedIn: false,
      info: {},
      privateKey: '',
      // This is just for initialization
      loginType: SocialLoginType.passwordless,
      ownerWalletAddress: '',
      scwAddress: '',
      hasMfa: false,
    } as UserState),
  getters: {
    walletAddressShrinked(state: UserState): string {
      const rpcStore = store.state.value.rpcStore
      const isGaslessConfigured =
        rpcStore.gaslessConfiguredStatus[rpcStore.selectedChainId]
      const { ownerWalletAddress, scwAddress } = state
      const address = isGaslessConfigured ? scwAddress : ownerWalletAddress
      const addressLength = address.length
      return `${address.slice(0, 5)}....${address.slice(addressLength - 5)}`
    },
    walletAddress(state: UserState): string {
      const rpcStore = store.state.value.rpcStore
      const isGaslessConfigured =
        rpcStore.gaslessConfiguredStatus[rpcStore.selectedChainId]
      const { ownerWalletAddress, scwAddress } = state
      return isGaslessConfigured ? scwAddress : ownerWalletAddress
    },
  },
  actions: {
    async handleSocialLogin(
      authProvider: AuthProvider,
      loginType: Exclude<SocialLoginType, SocialLoginType.passwordless>
    ): Promise<{ url: string; state: string }> {
      const val = await authProvider.loginWithSocial(loginType)
      if (!val) {
        throw new Error('loginWithSocial failed')
      }
      const { url, state } = val
      return { url, state }
    },
    setUserInfo({ privateKey, loginType, userInfo }) {
      this.privateKey = privateKey
      this.loginType = loginType
      this.info = userInfo
    },
    setLoginStatus(status: boolean) {
      this.isLoggedIn = status
    },
    async handleLogout(authProvider: AuthProvider): Promise<void> {
      authProvider.logout()
      const storage = getStorage()
      storage.session.clearUserInfo()
      storage.session.clearIsLoggedIn()
      this.$reset()
    },
    setWalletAddress(walletAddress: string): void {
      this.ownerWalletAddress = walletAddress
    },
  },
})
