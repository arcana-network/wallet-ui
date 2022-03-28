import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    isLoggedIn: false,
    info: {},
    appId: null,
  }),
  actions: {
    setLoginStatus(status) {
      this.isLoggedIn = status;
    },
    setInfo(info) {
      this.info = info;
    },
  },
});
