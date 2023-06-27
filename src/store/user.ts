import { AuthProvider } from '@arcana/auth-core'
import type { LoginType, UserInfo } from '@arcana/auth-core/types/types'
import { defineStore } from 'pinia'

import { getStorage } from '@/utils/storageWrapper'

type UserState = {
  isLoggedIn: boolean
  info: UserInfo
  privateKey: string
  walletAddress: string
  hasMfa: boolean
}

type PasswordLessLoginOptions = {
  withUI: boolean
}

export const useUserStore = defineStore('user', {
  state: () =>
    ({
      isLoggedIn: false,
      info: {},
      privateKey: '',
      walletAddress: '',
      hasMfa: false,
    } as UserState),
  getters: {
    walletAddressShrinked(state: UserState): string {
      const { walletAddress } = state
      const walletAddressLength = walletAddress.length
      return `${walletAddress.slice(0, 5)}....${walletAddress.slice(
        walletAddressLength - 5
      )}`
    },
  },
  actions: {
    async handleSocialLogin(
      authProvider: AuthProvider,
      loginType: Exclude<LoginType, LoginType.passwordless>
    ): Promise<{ url: string; state: string }> {
      const val = await authProvider.loginWithSocial(loginType)
      if (!val) {
        throw new Error('loginWithSocial failed')
      }
      const { url, state } = val
      return { url, state }
    },

    async handlePasswordlessLogin(
      authProvider: AuthProvider,
      email: string,
      options: PasswordLessLoginOptions
    ): Promise<void | string> {
      return await authProvider.loginWithOtp(email, options)
    },
    setUserInfo({ privateKey, userInfo }) {
      this.privateKey = privateKey
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
      this.walletAddress = walletAddress
    },
  },
})
