import { defineStore } from "pinia";

export const useRequestStore = defineStore("request", {
  state: () => ({
    currentRequest: null,
    pendingStatus: "none", // "none", "pending", "fulfilled"
    isPermissionRequired: false,
    permissionStatus: "none", // "none", "approved", "rejected"
  }),
  getters: {
    allowRequest(state) {
      return (
        !state.isPermissionRequired || state.permissionStatus === "approved"
      );
    },
  },
  actions: {
    setRequest(request, isPermissionRequired) {
      this.currentRequest = request;
      this.isPermissionRequired = isPermissionRequired;
      this.pendingStatus = "pending";
    },
    approveRequest() {
      this.permissionStatus = "approved";
    },
    rejectRequest() {
      this.permissionStatus = "rejected";
    },
  },
});
