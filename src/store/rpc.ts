import { defineStore } from 'pinia'

import type { RpcConfigWallet } from '@/models/RpcConfig'

type RpcConfigState = {
  rpcConfig: RpcConfigWallet | null
  walletbalance: string
  chainList: Array<RpcConfigWallet>
}

export const useRpcStore = defineStore('rpcStore', {
  state: () =>
    ({
      rpcConfig: null,
      walletbalance: '',
      chainList: [],
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
  },

  actions: {
    addNetwork(rpcConfig: RpcConfigWallet) {
      this.chainList.push(rpcConfig)
    },
    setChainList(chainList: Array<RpcConfigWallet>) {
      this.chainList = chainList
    },
    setRpcConfig(rpcConfig: RpcConfigWallet | null): void {
      this.rpcConfig = rpcConfig
    },
    setWalletBalance(balance): void {
      this.walletbalance = balance
    },
  },
})
