import { defineStore } from 'pinia'

import type { UserInfo, LoginTypes, Auth } from '@/models/User'

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
      authProvider: Auth,
      loginType: LoginTypes
    ): Promise<void> {
      if (authProvider.isLoggedIn()) return
      await authProvider.loginWithSocial(loginType)
      this.isLoggedIn = authProvider.isLoggedIn()
      const { privateKey, userInfo } = authProvider.getUserInfo()
      this.privateKey = privateKey
      this.info = userInfo
    },
    async handleLogout(authProvider: Auth): Promise<void> {
      await authProvider.logout()
      this.$reset()
    },
    setWalletAddress(walletAddress: string): void {
      this.walletAddress = walletAddress
    },
  },
})
