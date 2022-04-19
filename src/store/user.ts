import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: false,
    info: null,
    privateKey: null,
    walletAddress: null,
  }),
  getters: {
    walletAddressShrinked({ walletAddress }) {
      const walletAddressLength = walletAddress && walletAddress.length
      return (
        walletAddress &&
        `${walletAddress.slice(1, 7)}....${walletAddress.slice(
          walletAddressLength - 7
        )}`
      )
    },
  },
  actions: {
    async handleLogin(authProvider, loginType) {
      if (authProvider.isLoggedIn()) return
      await authProvider.loginWithSocial(loginType)
      this.isLoggedIn = authProvider.isLoggedIn()
      const { privateKey, userInfo } = authProvider.getUserInfo()
      this.privateKey = privateKey
      this.info = userInfo
    },
    async handleLogout(authProvider) {
      await authProvider.logout()
      this.$reset()
    },
    setWalletAddress(walletAddress) {
      this.walletAddress = walletAddress
    },
  },
})
