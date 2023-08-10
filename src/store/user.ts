import { AuthProvider, SocialLoginType } from '@arcana/auth-core'
import type { UserInfo } from '@arcana/auth-core/types/types'
import { defineStore } from 'pinia'

import { getStorage } from '@/utils/storageWrapper'

type UserState = {
  isLoggedIn: boolean
  info: UserInfo
  privateKey: string
  loginType: SocialLoginType
  walletAddress: string
  hasMfa: boolean
  token: string
}

export const useUserStore = defineStore('user', {
  state: () =>
    ({
      isLoggedIn: false,
      info: {},
      privateKey: '',
      // This is just for initialization
      loginType: SocialLoginType.passwordless,
      walletAddress: '',
      hasMfa: false,
      token: '',
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
      loginType: Exclude<SocialLoginType, SocialLoginType.passwordless>
    ): Promise<{ url: string; state: string }> {
      const val = await authProvider.loginWithSocial(loginType)
      if (!val) {
        throw new Error('loginWithSocial failed')
      }
      const { url, state } = val
      return { url, state }
    },
    setUserInfo({ privateKey, loginType, userInfo, token }) {
      this.privateKey = privateKey
      this.loginType = loginType
      this.info = userInfo
      this.token = token
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
