import { AppConfig, AppMode, RpcConfig } from '@arcana/auth'
import type { SocialLoginType } from '@arcana/auth-core'

type RequestMethod =
  | 'eth_sign'
  | 'personal_sign'
  | 'eth_decrypt'
  | 'eth_signTypedData_v4'
  | 'eth_signTransaction'
  | 'eth_sendTransaction'
  | 'eth_accounts'
  | 'eth_getEncryptionPublicKey'

const PERMISSIONS: Record<RequestMethod, boolean> = Object.freeze({
  eth_sign: true,
  personal_sign: true,
  eth_decrypt: true,
  eth_signTypedData_v4: true,
  eth_signTransaction: false,
  eth_sendTransaction: true,
  eth_accounts: false,
  eth_getEncryptionPublicKey: false,
})

type Request<T> = {
  id: number
  method: RequestMethod
  params: T
}

function requirePermission(
  request: Request<unknown>,
  appMode: AppMode
): boolean {
  if (appMode === AppMode.NoUI) return false
  return PERMISSIONS[request.method]
}

type Response = {
  id: number
  result: unknown
  error?: string
}

type ProviderConnectInfo = {
  chainId: string | number
}

type RedirectParentConnectionApi = {
  redirect(parentAppUrl: string | null): Promise<void>
  error(errorMessage: string): Promise<void>
}

type ParentConnectionApi = {
  getAppConfig(): AppConfig
  getRpcConfig(): RpcConfig
  onMethodResponse(method: RequestMethod, response: Response): void
  sendPendingRequestCount(count: number): void
  getParentUrl(): string
  onEvent(event: string, chain?: ProviderConnectInfo): void
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
  Request,
  RequestMethod,
  Response,
}
