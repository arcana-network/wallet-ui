import { defineStore } from 'pinia'

export const useRequestStore = defineStore('request', {
  state: () => ({
    pendingRequests: {},
    processQueue: [],
  }),
  getters: {
    pendingRequestsForApproval(state) {
      return Object.values(state.pendingRequests).map((item) => ({
        ...item.request,
        receivedTime: item.receivedTime,
      }))
    },
    areRequestsPendingForApproval(state) {
      const requests = Object.values(state.pendingRequests)
      return requests.length > 0
    },
  },
  actions: {
    addRequests(request, isPermissionRequired, receivedTime) {
      if (isPermissionRequired) {
        this.pendingRequests[request.id] = {
          request,
          receivedTime,
          isPermissionGranted: false,
        }
      } else {
        this.processQueue.push({ request, isPermissionGranted: true })
      }
    },
    approveRequest(requestId) {
      this.pendingRequests[requestId].isPermissionGranted = true
      this.processQueue.push(this.pendingRequests[requestId])
      delete this.pendingRequests[requestId]
    },
    rejectRequest(requestId) {
      this.pendingRequests[requestId].isPermissionGranted = false
      this.processQueue.push(this.pendingRequests[requestId])
      delete this.pendingRequests[requestId]
    },
  },
})
