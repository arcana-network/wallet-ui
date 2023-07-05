import { JsonRpcRequest } from 'json-rpc-engine'
import { defineStore } from 'pinia'

type PendingRequest = {
  request: JsonRpcRequest<unknown>
  receivedTime?: Date
  isPermissionGranted: boolean
}

type EIP1559GasFee = {
  maxFeePerGas: string
  maxPriorityFeePerGas: string
  gasLimit: number
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
    setGasFee(gas: EIP1559GasFee | null, requestId: string): void {
      const request = this.pendingRequests[requestId].request
      if (Array.isArray(request.params)) {
        const param = request.params[0]
        if (gas?.maxPriorityFeePerGas) {
          param.maxPriorityFeePerGas = gas.maxPriorityFeePerGas
        } else if (gas?.maxPriorityFeePerGas === null) {
          delete param.maxPriorityFeePerGas
        }
        if (gas?.maxFeePerGas) {
          param.maxFeePerGas = gas.maxFeePerGas
        } else if (gas?.maxFeePerGas === null) {
          delete param.maxFeePerGas
        }
        if (gas?.gasLimit) {
          param.gas = gas.gasLimit
        } else if (gas?.gasLimit === null) {
          delete param.gas
        }
        delete param.gasPrice
      }
    },
    skipRequest(requestId: string): void {
      this.skippedRequests[requestId] = this.pendingRequests[requestId]
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

export type { EIP1559GasFee }
