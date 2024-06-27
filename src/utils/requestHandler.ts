import type {
  AccountHandler,
  EVMAccountHandler,
  SolanaAccountHandler,
  MultiversXAccountHandler,
  NEARAccountHandler,
} from '@/utils/accountHandler'
import { ChainType } from '@/utils/chainType'
import { type EVMRequestHandler } from '@/utils/evm/requestHandler'
import { type MultiversXRequestHandler } from '@/utils/multiversx/requestHandler'
import { type NEARRequestHandler } from '@/utils/near/requestHandler'
import { type SolanaRequestHandler } from '@/utils/solana/requestHandler'

type RequestHandler =
  | EVMRequestHandler
  | SolanaRequestHandler
  | MultiversXRequestHandler
  | NEARRequestHandler

async function createRequestHandler(accountHandler: AccountHandler) {
  switch (accountHandler.chainType) {
    case ChainType.multiversx_cv25519: {
      const { MultiversXRequestHandler } = await import(
        '@/utils/multiversx/requestHandler'
      )
      return new MultiversXRequestHandler(
        accountHandler as MultiversXAccountHandler
      )
    }
    case ChainType.near_cv25519: {
      const { NEARRequestHandler } = await import('@/utils/near/requestHandler')
      return new NEARRequestHandler(accountHandler as NEARAccountHandler)
    }
    case ChainType.solana_cv25519: {
      const { SolanaRequestHandler } = await import(
        '@/utils/solana/requestHandler'
      )
      return new SolanaRequestHandler(accountHandler as SolanaAccountHandler)
    }
    default: {
      const { EVMRequestHandler } = await import('@/utils/evm/requestHandler')
      return new EVMRequestHandler(accountHandler as EVMAccountHandler)
    }
  }
}

export {
  createRequestHandler,
  type SolanaRequestHandler,
  type EVMRequestHandler,
  type RequestHandler,
}
