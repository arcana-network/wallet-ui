import { defineStore } from "pinia";

export const userStore = defineStore("user", {
  state: () => ({
    isUserLoggedIn: false,
    info: {},
    appId: null,
  }),
  getters: {
    isLoggedIn: (state) => state.isUserLoggedIn,
  },
});
