const PERMISSIONS = Object.freeze({
  eth_sign: true,
  personal_sign: true,
  eth_decrypt: true,
  eth_signTypedData_v4: true,
  eth_signTransaction: true,
  eth_sendTransaction: true,
  eth_accounts: false,
  eth_getEncryptionPublicKey: false,
})

type RequestMethod = keyof typeof PERMISSIONS
type Request = {
  id: number
  method: RequestMethod
  params: string[]
}

function requirePermission(request: Request): boolean {
  return PERMISSIONS[request.method]
}

export type { Request, RequestMethod }

export { requirePermission, PERMISSIONS }
