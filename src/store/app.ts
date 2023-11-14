import { AppMode } from '@arcana/auth'
import { defineStore } from 'pinia'

import type { SDKVersion } from '@/models/Connection'
import type { Theme } from '@/models/Theme'
import { useRequestStore } from '@/store/request'
import { isMobileViewport } from '@/utils/isMobileViewport'

type WalletPosition = 'right' | 'left'

type AppLogo = {
  horizontal: string
  vertical: string
}

type AppState = {
  id: string
  name: string
  theme: Theme
  standaloneMode: 0 | 1 | 2
  parentAppUrl: string | null
  validAppMode: AppMode
  showWallet: boolean
  expandRestoreScreen: boolean
  expandWallet: boolean
  walletPosition: WalletPosition
  appLogo: AppLogo
  compactMode: boolean
  sdkVersion: SDKVersion | null
  expandedByRequest: boolean
  isMfaEnabled: boolean
}

export const useAppStore = defineStore('app', {
  state: () =>
    ({
      id: '',
      theme: 'light',
      parentAppUrl: null,
      showWallet: false,
      standaloneMode: 0,
      expandWallet: true,
      expandRestoreScreen: false,
      walletPosition: 'right',
      compactMode: false,
      sdkVersion: null,
      expandedByRequest: false,
      isMfaEnabled: true,
    } as AppState),
  getters: {
    iframeStyle: ({
      showWallet,
      expandWallet,
      walletPosition,
      compactMode,
      expandRestoreScreen,
    }) => {
      return function getCompatibleStyles() {
        const requestStore = useRequestStore()
        const mobileViewport = isMobileViewport()
        const style: Partial<CSSStyleDeclaration> = {}

        style.height = showWallet
          ? expandWallet || expandRestoreScreen
            ? compactMode
              ? requestStore.pendingRequest?.request.method ===
                'eth_sendTransaction'
                ? '360px'
                : '300px'
              : '80vh'
            : '40px'
          : '0'
        style.width = showWallet
          ? expandWallet || expandRestoreScreen
            ? mobileViewport
              ? '100%'
              : '360px'
            : '100px'
          : '0'
        style.right =
          walletPosition === 'right' && !mobileViewport ? '30px' : ''
        style.left = walletPosition === 'left' && !mobileViewport ? '30px' : ''
        style.bottom =
          (expandWallet || expandRestoreScreen) && !mobileViewport
            ? '30px'
            : '0'
        style.transition = 'all 300ms ease-in-out'
        style.position = 'fixed'
        style.overflow = 'hidden'
        style.borderRadius = mobileViewport ? '0' : '10px'
        if (!compactMode && !expandWallet && !expandRestoreScreen) {
          style.borderBottomLeftRadius = '0'
          style.borderBottomRightRadius = '0'
          style.borderTopRightRadius = '5px'
          style.borderTopLeftRadius = '5px'
        }
        style.colorScheme = 'normal'
        return style
      }
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
    setStandalone(mode: 0 | 1 | 2): void {
      this.standaloneMode = mode
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
