import { defineStore } from "pinia";

export const useAppStore = defineStore("app", {
  state: () => ({
    id: null,
  }),
  actions: {
    setAppId(id) {
      this.id = id;
    },
  },
});
