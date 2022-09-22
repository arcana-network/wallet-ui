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
      const chainName: string = this.rpcConfig?.chainName?.toLowerCase() || ''
      return chainName.includes('arcana')
    },
    isEthereumMainnet(state: RpcConfigState) {
      return 1 === state.rpcConfig?.chainId
    },
    nativeCurrency(state: RpcConfigState) {
      const { rpcConfig } = state
      if (this.isArcanaNetwork) {
        return {
          name: 'Arcana',
          symbol: 'XAR',
          decimals: 18,
        }
      }
      if (rpcConfig?.nativeCurrency) {
        return {
          name: rpcConfig.chainName,
          ...rpcConfig.nativeCurrency,
        }
      }
      return {
        name: rpcConfig?.chainName || 'Unknown',
        symbol: '',
        decimals: 0,
      }
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
