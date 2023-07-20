import { AppConfig, AppMode, Position, RpcConfig } from '@arcana/auth'
import type { SocialLoginType } from '@arcana/auth-core'
import { JsonRpcRequest, PendingJsonRpcResponse } from 'json-rpc-engine'

type SDKVersion = 'v2' | 'v3'

type RequestMethod =
  | 'personal_sign'
  | 'eth_decrypt'
  | 'eth_signTypedData_v4'
  | 'eth_signTransaction'
  | 'eth_sendTransaction'
  | 'eth_accounts'
  | 'eth_requestAccounts'
  | 'eth_getEncryptionPublicKey'
  | 'wallet_addEthereumChain'
  | 'wallet_switchEthereumChain'

const PERMISSIONS: Record<RequestMethod, boolean> = Object.freeze({
  personal_sign: true,
  eth_decrypt: true,
  eth_signTypedData_v4: true,
  eth_signTransaction: true,
  eth_sendTransaction: true,
  eth_accounts: false,
  eth_requestAccounts: false,
  eth_getEncryptionPublicKey: false,
  wallet_addEthereumChain: true,
  wallet_switchEthereumChain: true,
  wallet_watchAsset: true,
})

function requirePermission(
  request: JsonRpcRequest<unknown>,
  appMode: AppMode
): boolean {
  if (appMode === AppMode.NoUI) return false
  return PERMISSIONS[request.method]
}

type ProviderEvent =
  | {
      chainId: string | number
    }
  | string[]
  | string
  | { type: string; data: unknown }

type RedirectParentConnectionApi = {
  redirect(url: string | null): Promise<void>
  replyTo(parentAppUrl?: string | null): Promise<void>
  goToWallet(): Promise<void>
  error(errorMessage: string, domain?: string): Promise<void>
}

type ParentConnectionApi = {
  getAppConfig(): AppConfig
  getRpcConfig(): RpcConfig
  getParentUrl(): string
  getAppMode(): Promise<AppMode>
  getWalletPosition(): Position
  getSDKVersion(): SDKVersion

  setIframeStyle(styles: Partial<CSSStyleDeclaration>): void
  setSessionID(sessionID: string, expiry: number): void

  onMethodResponse(
    method: string,
    response: PendingJsonRpcResponse<unknown>
  ): void
  sendPendingRequestCount(count: number): void
  onEvent(event: string, params?: ProviderEvent): void
  uiEvent(event: string, val: any): void
  triggerSocialLogin(type: SocialLoginType): void
  triggerPasswordlessLogin(email: string): void
}
type InitParentConnectionApi = {
  getParentUrl(): string
  getLoginSource(): string
  getPasswordlessParams(): { sessionId: string; setToken: string }
  error(e: string): void
  uiEvent(event: string, val: any): void
  setIframeStyle(styles: Partial<CSSStyleDeclaration>): void
}

export { requirePermission, PERMISSIONS }

export type {
  RedirectParentConnectionApi,
  ParentConnectionApi,
  InitParentConnectionApi,
  RequestMethod,
  ProviderEvent,
  SDKVersion,
}
