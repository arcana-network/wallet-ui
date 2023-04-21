import { defineStore } from 'pinia'

import { RpcConfigWallet, CHAIN_LIST } from '@/models/RpcConfigList'
import { getRequestHandler } from '@/utils/requestHandlerSingleton'

type RpcConfigs = {
  [chainId: number]: RpcConfigWallet
}

type RpcConfigState = {
  selectedRPCConfig: RpcConfigWallet
  selectedChainId: string | number

  walletBalance: string
  walletBalanceChainId: string
  walletBalancePollingIntervalID: NodeJS.Timer | null
  walletBalancePollingCleanupID: NodeJS.Timer | null

  rpcConfigs: RpcConfigs | null
  editChainId: number | null
}

export const useRpcStore = defineStore('rpcStore', {
  state: () =>
    ({
      selectedRPCConfig: CHAIN_LIST[0],
      selectedChainId: CHAIN_LIST[0].chainId,

      walletBalance: '',
      walletBalanceChainId: '',
      walletBalancePollingCleanupID: null,
      walletBalancePollingIntervalID: null,

      rpcConfigs: null,
      editChainId: null,
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
      return state.selectedRPCConfig
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
    getRpcConfig(chainId: number) {
      return this.rpcConfigs ? this.rpcConfigs[Number(chainId)] : null
    },
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
    setWalletBalance(balance): void {
      this.walletBalance = balance
      this.walletBalanceChainId = this.selectedRPCConfig.chainId
    },
    setSelectedChainId(chainId: string): void {
      this.selectedRPCConfig = this.rpcConfigs
        ? this.rpcConfigs[chainId]
        : this.selectedRPCConfig
      this.selectedChainId = Number(chainId)
    },
    setSelectedRPCConfig(cfg: RpcConfigWallet): void {
      this.selectedRPCConfig = cfg
      this.selectedChainId = Number(cfg.chainId)
    },
    setRpcConfig(config: RpcConfigWallet) {
      if (this.rpcConfigs) {
        this.rpcConfigs[Number(config.chainId)].rpcUrls = config.rpcUrls
      }
    },
    setRpcConfigs(list: Array<RpcConfigWallet>) {
      const configs = {}
      list.forEach((chainConfig) => {
        configs[chainConfig.chainId] = chainConfig
      })
      this.rpcConfigs = configs
    },

    async getWalletBalance() {
      const accountHandler = getRequestHandler().getAccountHandler()
      if (accountHandler) {
        const balance = (await accountHandler.getBalance()) || '0'
        this.setWalletBalance(balance.toString())
      }
    },

    cleanUpBalancePolling() {
      if (this.walletBalancePollingIntervalID != null) {
        clearInterval(this.walletBalancePollingIntervalID)
        this.walletBalancePollingIntervalID = null
      }
      if (this.walletBalancePollingCleanupID != null) {
        clearTimeout(this.walletBalancePollingCleanupID)
        this.walletBalancePollingCleanupID = null
      }
    },

    async setUpBalancePolling() {
      this.cleanUpBalancePolling()
      await this.getWalletBalance()
      // Poll every 10 seconds
      this.walletBalancePollingIntervalID = setInterval(
        this.getWalletBalance.bind(this),
        10 * 1000
      )
      this.walletBalancePollingCleanupID = setTimeout(() => {
        if (this.walletBalancePollingIntervalID != null) {
          clearInterval(this.walletBalancePollingIntervalID)
        }
      }, 10 * 60 * 1000)
    },
  },
})
