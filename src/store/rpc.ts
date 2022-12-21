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
  selectedChainId: string
  walletBalance: string
  rpcConfigs: RpcConfigs | null
  editChainId: number | null
  isChainChanged: boolean
}

export const useRpcStore = defineStore('rpcStore', {
  state: () =>
    ({
      selectedChainId: DEFAULT_CHAIN_ID,
      walletBalance: '',
      rpcConfigs: null,
      editChainId: null,
      isChainChanged: false,
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
    nativeCurrency() {
      const rpcConfig: RpcConfigWallet = this.selectedRpcConfig
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
    selectedRpcConfig(state: RpcConfigState): RpcConfigWallet {
      const { selectedChainId, rpcConfigs } = state
      if (this.rpcConfigs) return this.rpcConfigs[selectedChainId]
      else if (rpcConfigs) return rpcConfigs[DEFAULT_CHAIN_ID]
      else return CHAIN_LIST[0]
    },
    rpcConfigList(state: RpcConfigState): Array<RpcConfigWallet> {
      return Object.values(state.rpcConfigs || {})
    },
    rpcConfigForEdit(): RpcConfigWallet | null {
      if (this.rpcConfigs && this.editChainId)
        return this.rpcConfigs[this.editChainId]
      return null
    },
    isEthereumMainnet() {
      const selectedRpcConfig: RpcConfigWallet = this.selectedRpcConfig
      return selectedRpcConfig.chainId === `1`
    },
  },

  actions: {
    addNetwork(rpcConfig: RpcConfigWallet): void {
      if (this.rpcConfigs)
        this.rpcConfigs[rpcConfig.chainId] = { ...rpcConfig, isCustom: true }
      else this.rpcConfigs = { [rpcConfig.chainId]: rpcConfig }
    },
    editNetwork(chainId: number, rpcConfig: RpcConfigWallet): void {
      if (this.rpcConfigs) this.rpcConfigs[chainId] = rpcConfig
    },
    deleteNetwork(chainId: number): void {
      if (this.rpcConfigs) delete this.rpcConfigs[chainId]
    },
    setSelectedChainId(chainId: string): void {
      this.selectedChainId = chainId
      this.isChainChanged = true
    },
    setWalletBalance(balance): void {
      this.walletBalance = balance
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
