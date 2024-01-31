import base58 from 'bs58'

import { ChainType } from '@/utils/chainType'
import { EVMAccountHandler } from '@/utils/evm/accountHandler'
import { MultiversXAccountHandler } from '@/utils/multiversx/accountHandler'
import { SolanaAccountHandler } from '@/utils/solana/accountHandler'

type AccountHandler =
  | EVMAccountHandler
  | SolanaAccountHandler
  | MultiversXAccountHandler

function CreateAccountHandler(
  privateKey: string,
  rpcUrl: string,
  chainType: ChainType = ChainType.evm_secp256k1
): AccountHandler {
  if (chainType === ChainType.solana_cv25519) {
    // return new SolanaAccountHandler(base58.decode(privateKey), rpcUrl)
    return new MultiversXAccountHandler(
      base58.decode(privateKey),
      'https://devnet-api.multiversx.com/'
    )
  }
  return new EVMAccountHandler(privateKey, rpcUrl)
}

export {
  CreateAccountHandler,
  type EVMAccountHandler,
  type SolanaAccountHandler,
  type MultiversXAccountHandler,
  type AccountHandler,
  type ChainType as SupportedChainType,
}
