import { etc, getPublicKey } from '@noble/ed25519'
import { sha512 } from '@noble/hashes/sha512'
import bs58 from 'bs58'

// pk is in hex format with 64 length from key_helper
function getPrivateKey(pk: string) {
  const bytePk = etc.hexToBytes(pk)
  etc.sha512Sync = (...m) => sha512(etc.concatBytes(...m))
  const publicKey = getPublicKey(pk)

  return bs58.encode(etc.concatBytes(bytePk, publicKey))
}

export { getPrivateKey }
