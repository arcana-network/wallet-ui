import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    isLoggedIn: false,
    info: {},
    appId: null,
  }),
  getters: {
    isLoggedIn: (state) => state.isUserLoggedIn,
  },
});
