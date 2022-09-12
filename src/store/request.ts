import { defineStore } from 'pinia'

import type { Request } from '@/models/Connection'

type PendingRequest = {
  request: Request<unknown>
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
    pendingRequestsForApproval({ pendingRequests }): PendingRequest[] {
      return Object.values(pendingRequests)
    },
    areRequestsPendingForApproval(state: RequestState): boolean {
      const requests = Object.values(state.pendingRequests)
      return requests.length > 0
    },
  },
  actions: {
    addRequests(
      request: Request<unknown>,
      isPermissionRequired: boolean,
      receivedTime: Date
    ): void {
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
    setGasFee(gasPrice: string, requestId: string): void {
      const request = this.pendingRequests[requestId].request
      if (Array.isArray(request.params)) {
        const param = request.params[0]
        param.gasPrice = gasPrice
      }
    },
    approveRequest(requestId: string): void {
      this.pendingRequests[requestId].isPermissionGranted = true
      this.processQueue.push(this.pendingRequests[requestId])
      delete this.pendingRequests[requestId]
    },
    rejectRequest(requestId: string): void {
      this.pendingRequests[requestId].isPermissionGranted = false
      this.processQueue.push(this.pendingRequests[requestId])
      delete this.pendingRequests[requestId]
    },
  },
})
