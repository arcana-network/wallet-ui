import { AuthProvider } from '@arcana/auth'
import { LoginType } from '@arcana/auth/types/types'

async function getPublicKey(
  authProvider: AuthProvider,
  id: string,
  verifier: LoginType
) {
  return await authProvider.getPublicKey({ id, verifier })
}

export default getPublicKey
