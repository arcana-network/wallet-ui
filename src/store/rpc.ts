import { defineStore } from 'pinia'

import {
  RpcConfigWallet,
  DEFAULT_CHAIN_ID,
  CHAIN_LIST,
} from '@/models/RpcConfigList'

type RpcConfigs = {
  [chainId: number]: RpcConfigWallet
}

type RpcConfigState = {
  selectedChainId: number
  walletbalance: string
  rpcConfigs: RpcConfigs | null
}

export const useRpcStore = defineStore('rpcStore', {
  state: () =>
    ({
      selectedChainId: DEFAULT_CHAIN_ID,
      walletbalance: '',
      rpcConfigs: null,
    } as RpcConfigState),

  getters: {
    currency(): string {
      if (this.isArcanaNetwork) return 'XAR'
      if (this.selectedRpcConfig?.nativeCurrency)
        return this.selectedRpcConfig.nativeCurrency.symbol
      else return ''
    },
    isArcanaNetwork() {
      const chainName: string =
        this.selectedRpcConfig?.chainName?.toLowerCase() || ''
      return chainName.includes('arcana')
    },
    selectedRpcConfig(state: RpcConfigState): RpcConfigWallet {
      const { selectedChainId } = state
      if (this.rpcConfigs) return this.rpcConfigs[selectedChainId]
      else return CHAIN_LIST[DEFAULT_CHAIN_ID]
    },
  },

  actions: {
    addNetwork(rpcConfig: RpcConfigWallet) {
      if (this.rpcConfigs) this.rpcConfigs[rpcConfig.chainId] = rpcConfig
      else this.rpcConfigs = { [rpcConfig.chainId]: rpcConfig }
    },
    setSelectedChainId(chainId: number): void {
      this.selectedChainId = chainId
    },
    setWalletBalance(balance): void {
      this.walletbalance = balance
    },
    setRpcConfigs(list: Array<RpcConfigWallet>) {
      const configs = {}
      list.forEach((chainConfig) => {
        configs[chainConfig.chainId] = chainConfig
      })
      this.rpcConfigs = configs
    },
  },
})
