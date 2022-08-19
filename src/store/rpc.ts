import type { RpcConfig } from '@arcana/auth'
import { defineStore } from 'pinia'

type RpcConfigState = {
  rpcConfig: RpcConfig | null
}

export const useRpcStore = defineStore('rpcStore', {
  state: () =>
    ({
      rpcConfig: null,
    } as RpcConfigState),

  actions: {
    setRpcConfig(rpcConfig: RpcConfig): void {
      this.rpcConfig = rpcConfig
    },
  },
})
