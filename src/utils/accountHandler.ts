import base58 from 'bs58'

import { ChainType } from '@/utils/chainType'
import { EVMAccountHandler } from '@/utils/evm/accountHandler'
import { SolanaAccountHandler } from '@/utils/solana/accountHandler'

type AccountHandler = EVMAccountHandler | SolanaAccountHandler

function CreateAccountHandler(
  privateKey: string,
  rpcUrl: string,
  chainType: ChainType = ChainType.evm_secp256k1
): AccountHandler {
  if (chainType === ChainType.solana_cv25519) {
    return new SolanaAccountHandler(base58.decode(privateKey), rpcUrl)
  }
  return new EVMAccountHandler(privateKey, rpcUrl)
}

export {
  CreateAccountHandler,
  type EVMAccountHandler,
  type SolanaAccountHandler,
  type AccountHandler,
  type ChainType as SupportedChainType,
}
