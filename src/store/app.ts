import { AppMode } from '@arcana/auth'
import { defineStore } from 'pinia'

import type { SDKVersion } from '@/models/Connection'
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
  compactMode: boolean
  sdkVersion: SDKVersion | null
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
      compactMode: false,
      sdkVersion: null,
    } as AppState),
  getters: {
    iframeStyle: ({
      showWallet,
      expandWallet,
      walletPosition,
      compactMode,
    }) => {
      const style: Partial<CSSStyleDeclaration> = {}
      style.height = showWallet
        ? expandWallet
          ? compactMode
            ? '200px'
            : '80vh'
          : '44px'
        : '0'
      style.width = showWallet ? (expandWallet ? '360px' : '56px') : '0'
      style.right =
        walletPosition === 'right' ? (expandWallet ? '18px' : '2px') : ''
      style.left =
        walletPosition === 'left' ? (expandWallet ? '18px' : '2px') : ''
      style.bottom = '4px'
      style.transition = 'all 300ms ease-in-out'
      return style
    },
  },
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
    setWalletPosition(position: WalletPosition): void {
      this.walletPosition = position
    },
    setAppLogo(logo: AppLogo): void {
      this.appLogo = logo
    },
  },
})
