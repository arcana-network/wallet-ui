import { defineStore } from "pinia";

export const useAppStore = defineStore("app", {
  state: () => ({
    id: null,
    theme: "light",
  }),
  actions: {
    setAppId(id) {
      this.id = id;
    },
    setTheme(theme) {
      this.theme = theme;
    },
  },
});
