// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { AppMode } from '@arcana/auth'
import { defineStore } from 'pinia'

import type { Theme } from '@/models/Theme'

type WalletPosition = 'right' | 'left'

type AppLogo = {
  horizontal: string
  vertical: string
}

type AppState = {
  id: string
  name: string
  theme: Theme
  parentAppUrl: string | null
  validAppMode: AppMode
  showWallet: boolean
  expandWallet: boolean
  walletPosition: WalletPosition
  appLogo: AppLogo
}

export const useAppStore = defineStore('app', {
  state: () =>
    ({
      id: '',
      theme: 'light',
      parentAppUrl: null,
      showWallet: false,
      expandWallet: true,
      walletPosition: 'right',
    } as AppState),
  actions: {
    setAppId(id: string): void {
      this.id = id
    },
    setTheme(theme: Theme): void {
      this.theme = theme
    },
    setName(name: string): void {
      this.name = name
    },
    setParentUrl(url: string): void {
      this.parentAppUrl = url
    },
    setAppMode(validAppMode: AppMode): void {
      this.validAppMode = validAppMode
    },
  },
})
