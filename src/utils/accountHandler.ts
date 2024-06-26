import base58 from 'bs58'

import { ChainType } from '@/utils/chainType'
import { type EVMAccountHandler } from '@/utils/evm/accountHandler'
import { type MultiversXAccountHandler } from '@/utils/multiversx/accountHandler'
import { type NEARAccountHandler } from '@/utils/near/accountHandler'
import { type SolanaAccountHandler } from '@/utils/solana/accountHandler'

type AccountHandler =
  | EVMAccountHandler
  | SolanaAccountHandler
  | MultiversXAccountHandler
  | NEARAccountHandler

async function CreateAccountHandler(
  privateKey: string,
  rpcUrl: string,
  chainType: ChainType = ChainType.evm_secp256k1
): Promise<AccountHandler> {
  switch (chainType) {
    case ChainType.multiversx_cv25519: {
      const { MultiversXAccountHandler } = await import(
        '@/utils/multiversx/accountHandler'
      )
      return new MultiversXAccountHandler(base58.decode(privateKey), rpcUrl)
    }
    case ChainType.solana_cv25519: {
      const { SolanaAccountHandler } = await import(
        '@/utils/solana/accountHandler'
      )
      return new SolanaAccountHandler(base58.decode(privateKey), rpcUrl)
    }
    case ChainType.near_cv25519: {
      const { NEARAccountHandler } = await import('@/utils/near/accountHandler')
      return new NEARAccountHandler(privateKey)
    }
    default: {
      const { EVMAccountHandler } = await import('@/utils/evm/accountHandler')
      return new EVMAccountHandler(privateKey, rpcUrl)
    }
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
