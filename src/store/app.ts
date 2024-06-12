import { AppMode } from '@arcana/auth'
import { CURVE } from '@arcana/key-helper'
import { defineStore } from 'pinia'

import type { SDKVersion } from '@/models/Connection'
import type { Theme } from '@/models/Theme'
import { useRequestStore } from '@/store/request'
import { ChainType } from '@/utils/chainType'
import { AUTH_NETWORK } from '@/utils/constants'
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
  chainType: ChainType
  curve: CURVE
  global?: boolean
}

export const useAppStore = defineStore('app', {
  state: () =>
    ({
      id: '',
      theme: 'dark',
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
      chainType: ChainType.evm_secp256k1,
      curve: CURVE.SECP256K1,
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
                ? AUTH_NETWORK === 'mainnet'
                  ? '364px'
                  : '400px'
                : AUTH_NETWORK === 'mainnet'
                ? '296px'
                : '326px'
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
    setChainType(chainType: string): void {
      this.curve = CURVE.ED25519
      if (chainType.toLowerCase() === 'multiversx') {
        this.chainType = ChainType.multiversx_cv25519
      } else if (chainType?.toLowerCase() === 'solana') {
        this.chainType = ChainType.solana_cv25519
      } else if (chainType?.toLowerCase() === 'near') {
        this.chainType = ChainType.near_cv25519
      } else {
        this.chainType = ChainType.evm_secp256k1
        this.curve = CURVE.SECP256K1
      }
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
    setIsGlobalKeyspace(global: boolean): void {
      this.global = global
    },
  },
})
