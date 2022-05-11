import type { ThemeConfig } from '@/models/Theme'

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
  eth_sendTransaction: false,
  eth_accounts: false,
  eth_getEncryptionPublicKey: false,
})

type Request = {
  id: number
  method: RequestMethod
  params: string[]
}

function requirePermission(request: Request): boolean {
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

type ParentConnectionApi = {
  getThemeConfig(): ThemeConfig
  onMethodResponse(method: RequestMethod, response: Response): void
  sendPendingRequestCount(count: number): void
  getParentUrl(): string
  redirect(parentAppUrl: string | null): Promise<void>
  onEvent(event: string, chain: ProviderConnectInfo | null): void
}

export { requirePermission, PERMISSIONS }

export type { ParentConnectionApi, Request, RequestMethod, Response }
