import { AuthProvider } from '@arcana/auth'
import type { LoginType, UserInfo } from '@arcana/auth/types/types'
import { defineStore } from 'pinia'

type UserState = {
  isLoggedIn: boolean
  info: UserInfo
  privateKey: string
  walletAddress: string
}

export const useUserStore = defineStore('user', {
  state: () =>
    ({
      isLoggedIn: false,
      info: {},
      privateKey: '',
      walletAddress: '',
    } as UserState),
  getters: {
    walletAddressShrinked(state: UserState): string {
      const { walletAddress } = state
      const walletAddressLength = walletAddress.length
      return `${walletAddress.slice(1, 7)}....${walletAddress.slice(
        walletAddressLength - 7
      )}`
    },
  },
  actions: {
    async handleLogin(
      authProvider: AuthProvider,
      loginType: LoginType
    ): Promise<void> {
      if (authProvider.isLoggedIn()) return
      await authProvider.loginWithSocial(loginType)
      this.isLoggedIn = authProvider.isLoggedIn()
      const { privateKey, userInfo } = authProvider.getUserInfo()
      this.privateKey = privateKey
      this.info = userInfo
    },
    async handleLogout(authProvider: AuthProvider): Promise<void> {
      await authProvider.logout()
      this.$reset()
    },
    setWalletAddress(walletAddress: string): void {
      this.walletAddress = walletAddress
    },
  },
})
