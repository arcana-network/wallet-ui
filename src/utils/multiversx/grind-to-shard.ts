import { UserSecretKey, UserPublicKey } from '@multiversx/sdk-wallet'
import hkdf from 'futoin-hkdf'

const maskN = Math.ceil(Math.log2(3))
const maskHigh = (1 << maskN) - 1
const maskLow = (1 << (maskN - 1)) - 1
const salt = Buffer.from('ARCANA', 'utf-8')

function computeShardID(_privKey: Buffer): number {
  const privKey = new UserSecretKey(_privKey.subarray(0, -32))
  const pubKey = privKey.generatePublicKey().valueOf()

  const startingIndex = pubKey.length - 1
  const usedBuffer = pubKey.subarray(startingIndex)

  let addr = 0
  for (let i = 0; i < usedBuffer.length; i++) {
    addr = (addr << 8) + usedBuffer[i]
  }

  let shard = addr & maskHigh
  if (shard > 2) {
    shard = addr & maskLow
  }

  return shard
}

export function grindToShard(key: Buffer, requiredShardID: number): Buffer {
  {
    const shardID = computeShardID(key)
    if (shardID === requiredShardID) {
      return key
    }
  }

  let counter = 0n
  for (;;) {
    const cStr = counter.toString(16)
    const currentIteration = hkdf(key, key.length, {
      salt,
      info: Buffer.from(
        cStr.padStart(Math.ceil(cStr.length / 2) * 2, '0'),
        'hex'
      ),
    })
    const shardID = computeShardID(currentIteration)
    if (shardID !== requiredShardID) {
      counter += 1n
    } else {
      return currentIteration
    }
  }
}
