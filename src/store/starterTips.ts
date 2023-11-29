import { defineStore } from 'pinia'

type StarterTipsStoreState = {
  show: boolean
  activePageNumber: number
}

export const useStarterTipsStore = defineStore('starterTipsStore', {
  state: () =>
    ({
      show: false,
      activePageNumber: 1,
    } as StarterTipsStoreState),

  getters: {
    showWalletAddress(): boolean {
      return this.activePageNumber === 2
    },
    showSwitchNetwork(): boolean {
      return this.activePageNumber === 3
    },
    showExportkey(): boolean {
      return this.activePageNumber === 5
    },
    showBuyButton(): boolean {
      return this.activePageNumber === 6
    },
  },

  actions: {
    setShowStarterTips(): void {
      this.show = true
    },
    setHideStarterTips(): void {
      this.show = false
      this.activePageNumber = 1
    },
    setActivePageNumber(pageNumber: number): void {
      this.activePageNumber = pageNumber
    },
  },
})
