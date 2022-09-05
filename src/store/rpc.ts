import type { RpcConfig } from '@arcana/auth'
import { defineStore } from 'pinia'

type RpcConfigState = {
  rpcConfig: RpcConfig | null
  walletbalance: string
}

export const useRpcStore = defineStore('rpcStore', {
  state: () =>
    ({
      rpcConfig: null,
      walletbalance: '',
    } as RpcConfigState),

  getters: {
    currency(state: RpcConfigState): string {
      const { rpcConfig } = state
      if (this.isArcanaNetwork) return 'XAR'
      if (rpcConfig?.nativeCurrency) return rpcConfig.nativeCurrency.symbol
      else return ''
    },
    isArcanaNetwork() {
      return this.rpcConfig?.chainName?.toLowerCase('arcana')
    },
  },

  actions: {
    setRpcConfig(rpcConfig: RpcConfig): void {
      this.rpcConfig = rpcConfig
    },
    setWalletBalance(balance): void {
      this.walletbalance = balance
    },
  },
})
