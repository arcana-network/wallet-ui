import type { JsonRpcRequest } from '@metamask/utils'
import { defineStore } from 'pinia'

type RequestOrigin = 'wallet-ui' | 'auth-verify'

type PendingRequest = {
  request: JsonRpcRequest<unknown>
  receivedTime?: Date
  isPermissionGranted: boolean
  requestOrigin?: RequestOrigin
}

type EIP1559GasFee = {
  maxFeePerGas: string
  maxPriorityFeePerGas: string
  gasLimit: number
}

type LegacyGasFee = {
  gasPrice: string
  gasLimit: number
}

type GasFee = EIP1559GasFee | LegacyGasFee

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
    setGasFee(gas: GasFee | null, requestId: string): void {
      const request =
        this.pendingRequests[requestId]?.request ||
        this.skippedRequests[requestId]?.request
      if (Array.isArray(request.params)) {
        const param = request.params[0]
        if (param.type && Number(param.type) === 2) {
          const eipGas = gas as EIP1559GasFee | null
          if (eipGas?.maxPriorityFeePerGas) {
            param.maxPriorityFeePerGas = eipGas.maxPriorityFeePerGas
          } else if (eipGas?.maxPriorityFeePerGas === null) {
            delete param.maxPriorityFeePerGas
          }
          if (eipGas?.maxFeePerGas) {
            param.maxFeePerGas = eipGas.maxFeePerGas
          } else if (eipGas?.maxFeePerGas === null) {
            delete param.maxFeePerGas
          }
        } else {
          const legacyGas = gas as LegacyGasFee | null
          if (legacyGas?.gasPrice) {
            param.gasPrice = legacyGas.gasPrice
          } else if (legacyGas?.gasPrice === null) {
            delete param.gasPrice
          } else if ((gas as EIP1559GasFee | null)?.maxFeePerGas) {
            param.gasPrice = (gas as EIP1559GasFee).maxFeePerGas
          }
        }
        if (gas?.gasLimit) {
          param.gas = gas.gasLimit
        } else if (gas?.gasLimit === null) {
          delete param.gas
        }
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

export type { EIP1559GasFee, LegacyGasFee, GasFee }
