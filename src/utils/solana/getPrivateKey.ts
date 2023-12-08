import { etc, getPublicKeyAsync } from '@noble/ed25519'
import bs58 from 'bs58'

import { devLogger } from '@/utils/devLogger'

// pk is in hex format with 64 length from key_helper
async function getPrivateKey(pk: string) {
  devLogger.log('[getPrivateKey] before gen', { privateKeyFromAuthCore: pk })
  const bytePk = etc.hexToBytes(pk)
  const publicKey = await getPublicKeyAsync(pk)
  devLogger.log('[getPrivateKey] after gen', {
    privateKey: bs58.encode(etc.concatBytes(bytePk, publicKey)),
  })
  return bs58.encode(etc.concatBytes(bytePk, publicKey))
}

export { getPrivateKey }
