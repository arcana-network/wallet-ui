import { defineStore } from 'pinia'

import { RpcConfigWallet } from '@/models/RpcConfigList'
import { getRequestHandler } from '@/utils/requestHandlerSingleton'

const BALANCE_POLLING_INTERVAL = 10 * 1000
const BALANCE_POLLING_DURATION = 10 * 60 * 1000

type RpcConfigs = {
  [chainId: number]: RpcConfigWallet
}

type RpcConfigState = {
  selectedRPCConfig: RpcConfigWallet | null
  selectedChainId: string | number | null

  walletBalance: string
  walletBalanceChainId: string | undefined
  walletBalancePollingIntervalID: NodeJS.Timer | null
  walletBalancePollingCleanupID: NodeJS.Timer | null
  gaslessConfiguredStatus: {
    [chainId: string]: boolean
  }

  rpcConfigs: RpcConfigs | null
  editChainId: number | null
}

export const useRpcStore = defineStore('rpcStore', {
  state: () =>
    ({
      selectedRPCConfig: null,
      selectedChainId: null,

      walletBalance: '0',
      walletBalanceChainId: '',
      walletBalancePollingCleanupID: null,
      walletBalancePollingIntervalID: null,
      gaslessConfiguredStatus: {},

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
      if (!this.selectedRPCConfig) return null
      const rpcConfig: RpcConfigWallet | null = this.selectedRpcConfig
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
    selectedRpcConfig(state: RpcConfigState): RpcConfigWallet | null {
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
      const selectedRpcConfig: RpcConfigWallet | null = this.selectedRpcConfig
      return Number(selectedRpcConfig?.chainId) === 1
    },
    isGaslessConfigured(state: RpcConfigState) {
      return state.gaslessConfiguredStatus[state.selectedChainId as string]
    },
  },
  actions: {
    setGaslessConfiguredStatus(chainId: string, status: boolean) {
      this.gaslessConfiguredStatus[chainId] = status
    },
    getRpcConfig(chainId: number) {
      return this.rpcConfigs ? this.rpcConfigs[Number(chainId)] : null
    },
    addNetwork(rpcConfig: RpcConfigWallet): void {
      if (this.rpcConfigs)
        this.rpcConfigs[rpcConfig.chainId] = { ...rpcConfig, isCustom: true }
      else this.rpcConfigs = { [rpcConfig.chainId]: rpcConfig }
    },
    editNetwork(chainId: number, rpcConfig: RpcConfigWallet): void {
      if (this.rpcConfigs) {
        if (Number(rpcConfig.chainId) !== Number(chainId))
          delete this.rpcConfigs[rpcConfig.chainId]
        else this.rpcConfigs[rpcConfig.chainId] = rpcConfig
      }
    },
    deleteNetwork(chainId: number): void {
      if (this.rpcConfigs) delete this.rpcConfigs[chainId]
    },
    setWalletBalance(balance): void {
      this.walletBalance = balance
      this.walletBalanceChainId = this.selectedRPCConfig?.chainId
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
        BALANCE_POLLING_INTERVAL
      )
      this.walletBalancePollingCleanupID = setTimeout(() => {
        if (this.walletBalancePollingIntervalID != null) {
          clearInterval(this.walletBalancePollingIntervalID)
        }
      }, BALANCE_POLLING_DURATION)
    },
  },
})
