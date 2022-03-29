import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    isLoggedIn: false,
    info: null,
    privateKey: null,
  }),
  actions: {
    async handleLogin(authProvider, loginType) {
      if (authProvider.isLoggedIn()) return;
      await authProvider.loginWithSocial(loginType);
      this.isLoggedIn = authProvider.isLoggedIn();
      const { privateKey, userInfo } = authProvider.getUserInfo();
      this.privateKey = privateKey;
      this.info = userInfo;
    },
  },
});
