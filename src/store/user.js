import { defineStore } from "pinia";

export const userStore = defineStore("user", {
  state: () => ({
    isLoggedIn: false,
    info: {},
    appId: null,
  }),
  getters: {
    isLoggedIn: (state) => state.isUserLoggedIn,
  },
});
