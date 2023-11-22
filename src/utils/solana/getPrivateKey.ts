import { etc, getPublicKeyAsync } from '@noble/ed25519'
import bs58 from 'bs58'

// pk is in hex format with 64 length from key_helper
async function getPrivateKey(pk: string) {
  const bytePk = etc.hexToBytes(pk)
  const publicKey = await getPublicKeyAsync(pk)

  return bs58.encode(etc.concatBytes(bytePk, publicKey))
}

export { getPrivateKey }
