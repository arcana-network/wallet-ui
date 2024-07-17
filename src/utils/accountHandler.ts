import base58 from 'bs58'

import { ChainType } from '@/utils/chainType'
import { EVMAccountHandler } from '@/utils/evm/accountHandler'
import { MultiversXAccountHandler } from '@/utils/multiversx/accountHandler'
import { NEARAccountHandler } from '@/utils/near/accountHandler'
import { SolanaAccountHandler } from '@/utils/solana/accountHandler'

type AccountHandler =
  | EVMAccountHandler
  | SolanaAccountHandler
  | MultiversXAccountHandler
  | NEARAccountHandler

function CreateAccountHandler(
  privateKey: string,
  rpcUrl: string,
  chainType: ChainType = ChainType.evm_secp256k1
): AccountHandler {
  switch (chainType) {
    case ChainType.multiversx_cv25519:
      return new MultiversXAccountHandler(Buffer.from(base58.decode(privateKey)), rpcUrl)
    case ChainType.solana_cv25519:
      return new SolanaAccountHandler(base58.decode(privateKey), rpcUrl)
    case ChainType.near_cv25519:
      return new NEARAccountHandler(privateKey)
    default:
      return new EVMAccountHandler(privateKey, rpcUrl)
  }
}

export {
  CreateAccountHandler,
  type EVMAccountHandler,
  type SolanaAccountHandler,
  type MultiversXAccountHandler,
  type AccountHandler,
  type ChainType as SupportedChainType,
}
