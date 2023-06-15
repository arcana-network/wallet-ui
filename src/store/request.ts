import { JsonRpcRequest } from 'json-rpc-engine'
import { defineStore } from 'pinia'

type PendingRequest = {
  request: JsonRpcRequest<unknown>
  receivedTime?: Date
  isPermissionGranted: boolean
}

type RequestState = {
  pendingRequests: { [key: string]: PendingRequest }
  skippedRequests: { [key: string]: PendingRequest }
  processQueue: PendingRequest[]
}

export const useRequestStore = defineStore('request', {
  state: () =>
    ({
      pendingRequests: {},
      processQueue: [],
      skippedRequests: {},
    } as RequestState),
  getters: {
    pendingRequestsForApproval({ pendingRequests }): PendingRequest[] {
      return Object.values(pendingRequests)
    },
    areRequestsPendingForApproval(state: RequestState): boolean {
      const requests = Object.values(state.pendingRequests)
      return requests.length > 0
    },
    skippedRequestsPendingForApprovalLength(state: RequestState): number {
      return Object.values(state.skippedRequests).length
    },
    skippedRequestsForApproval({ skippedRequests }): PendingRequest[] {
      return Object.values(skippedRequests)
    },
    pendingRequest({ pendingRequests }) {
      if (this.areRequestsPendingForApproval) {
        return Object.values(pendingRequests)[0]
      }
    },
    skippedRequest({ skippedRequests }) {
      if (this.skippedRequestsPendingForApprovalLength > 0) {
        return Object.values(skippedRequests)[0]
      }
    },
  },
  actions: {
    addRequests(
      request: JsonRpcRequest<unknown> & { id: number },
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
        param.maxPriorityFeePerGas = '0x1'
        param.maxFeePerGas = gasPrice
      }
    },
    skipRequest(requestId: string): void {
      this.skippedRequests[requestId] = this.pendingRequests[requestId]
      console.log(this.skippedRequests)
      delete this.pendingRequests[requestId]
    },
    approveSkippedRequest(requestId: string): void {
      this.skippedRequests[requestId].isPermissionGranted = true
      this.processQueue.push(this.skippedRequests[requestId])
      delete this.skippedRequests[requestId]
    },
    approveRequest(requestId: string): void {
      this.pendingRequests[requestId].isPermissionGranted = true
      this.processQueue.push(this.pendingRequests[requestId])
      delete this.pendingRequests[requestId]
    },
    rejectSkippedRequest(requestId: string): void {
      this.skippedRequests[requestId].isPermissionGranted = false
      this.processQueue.push(this.skippedRequests[requestId])
      delete this.skippedRequests[requestId]
    },
    rejectRequest(requestId: string): void {
      this.pendingRequests[requestId].isPermissionGranted = false
      this.processQueue.push(this.pendingRequests[requestId])
      delete this.pendingRequests[requestId]
    },
  },
})
