// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

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
      loginType: LoginType
    ): Promise<void | string> {
      return await authProvider.loginWithSocial(loginType)
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
      await authProvider.logout()
      const storage = getStorage()
      storage.session.removeItem('userInfo')
      storage.session.removeItem('isLoggedIn')
      this.$reset()
    },
    setWalletAddress(walletAddress: string): void {
      this.walletAddress = walletAddress
    },
  },
})
