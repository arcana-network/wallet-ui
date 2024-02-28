import { defineStore } from 'pinia'

type GaslessStoreState = {
  showUseWalletBalancePermission: boolean
  canUseWalletBalance: boolean | null
}

export const useGaslessStore = defineStore('gaslessStore', {
  state: () =>
    ({
      showUseWalletBalancePermission: false,
      canUseWalletBalance: null,
    } as GaslessStoreState),
})
