import { UserSecretKey } from '@multiversx/sdk-wallet'
import { Mnemonic } from '@multiversx/sdk-wallet/out/mnemonic'

import { devLogger } from '@/utils/devLogger'

const maskN = Math.ceil(Math.log2(3))
const maskHigh = (1 << maskN) - 1
const maskLow = (1 << (maskN - 1)) - 1

function computeShardID(privKey: UserSecretKey): number {
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

function getMnemonicInShard(expectedShardID: number | undefined) {
  for (;;) {
    const mnemonic = Mnemonic.generate()
    const key = mnemonic.deriveKey()
    if (expectedShardID == undefined) {
      return mnemonic
    }
    const shardID = computeShardID(key)
    devLogger.log({ expectedShardID, shardID })
    if (shardID !== expectedShardID) {
      continue
    }
    return mnemonic
  }
}

export { getMnemonicInShard }
