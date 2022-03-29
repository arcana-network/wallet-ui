import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    isLoggedIn: false,
    info: {},
  }),
  actions: {
    async handleLogin(authProvider, loginType) {
      if (authProvider.isLoggedIn()) return;
      await authProvider.loginWithSocial(loginType);
      this.isLoggedIn = authProvider.isLoggedIn();
      this.info = authProvider.getUserInfo();
    },
  },
});
