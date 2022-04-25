import { defineStore } from 'pinia'

import type { Request } from '@/models/Connection'

type PendingRequest = {
  request: Request
  receivedTime?: Date
  isPermissionGranted: boolean
}

type RequestState = {
  pendingRequests: { [key: string]: PendingRequest }
  processQueue: PendingRequest[]
}

export const useRequestStore = defineStore('request', {
  state: () =>
    ({
      pendingRequests: {},
      processQueue: [],
    } as RequestState),
  getters: {
    pendingRequestsForApproval(state) {
      return Object.values(state.pendingRequests).map((item) => ({
        ...item.request,
        receivedTime: item.receivedTime,
      }))
    },
    areRequestsPendingForApproval(state: RequestState) {
      const requests = Object.values(state.pendingRequests)
      return requests.length > 0
    },
  },
  actions: {
    addRequests(
      request: Request,
      isPermissionRequired: boolean,
      receivedTime: Date
    ) {
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
    approveRequest(requestId: string) {
      this.pendingRequests[requestId].isPermissionGranted = true
      this.processQueue.push(this.pendingRequests[requestId])
      delete this.pendingRequests[requestId]
    },
    rejectRequest(requestId: string) {
      this.pendingRequests[requestId].isPermissionGranted = false
      this.processQueue.push(this.pendingRequests[requestId])
      delete this.pendingRequests[requestId]
    },
  },
})
