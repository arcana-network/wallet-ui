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
  getters: {
    iframeStyle: ({ showWallet, expandWallet, walletPosition }) => {
      const style: CSSStyleDeclaration = {}
      style.height = showWallet ? (expandWallet ? '80vh' : '46px') : '0'
      style.width = showWallet ? (expandWallet ? '360px' : '58px') : '0'
      style.right = walletPosition === 'right' ? '0px' : ''
      style.left = walletPosition === 'left' ? '0px' : ''
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
