import { AppConfig, AppMode, RpcConfig } from '@arcana/auth'
import type { SocialLoginType } from '@arcana/auth-core'
import { JsonRpcRequest, PendingJsonRpcResponse } from 'json-rpc-engine'

type RequestMethod =
  | 'eth_sign'
  | 'personal_sign'
  | 'eth_decrypt'
  | 'eth_signTypedData_v4'
  | 'eth_signTransaction'
  | 'eth_sendTransaction'
  | 'eth_accounts'
  | 'eth_getEncryptionPublicKey'
  | 'wallet_addEthereumChain'
  | 'wallet_switchEthereumChain'

const PERMISSIONS: Record<RequestMethod, boolean> = Object.freeze({
  eth_sign: true,
  personal_sign: true,
  eth_decrypt: true,
  eth_signTypedData_v4: true,
  eth_signTransaction: true,
  eth_sendTransaction: true,
  eth_accounts: false,
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
      chainId: number
    }
  | string[]
  | string
  | { type: string; data: unknown }

type RedirectParentConnectionApi = {
  redirect(url: string | null): Promise<void>
  replyTo(parentAppUrl: string | null): Promise<void>
  error(errorMessage: string, parentAppUrl: string): Promise<void>
}

type ParentConnectionApi = {
  getAppConfig(): AppConfig
  getRpcConfig(): RpcConfig
  onMethodResponse(
    method: string,
    response: PendingJsonRpcResponse<unknown>
  ): void
  sendPendingRequestCount(count: number): void
  getParentUrl(): string
  onEvent(event: string, params?: ProviderEvent): void
  getAppMode(): Promise<AppMode>
  triggerSocialLogin(type: SocialLoginType): void
  triggerPasswordlessLogin(email: string): void
}
type InitParentConnectionApi = {
  getParentUrl(): string
  error(e: string): void
}

export { requirePermission, PERMISSIONS }

export type {
  RedirectParentConnectionApi,
  ParentConnectionApi,
  InitParentConnectionApi,
  RequestMethod,
  ProviderEvent,
}
