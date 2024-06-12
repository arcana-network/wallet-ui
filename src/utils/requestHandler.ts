import {
  AccountHandler,
  EVMAccountHandler,
  SolanaAccountHandler,
  MultiversXAccountHandler,
} from '@/utils/accountHandler'
import { ChainType } from '@/utils/chainType'
import { EVMRequestHandler } from '@/utils/evm/requestHandler'
import { MultiversXRequestHandler } from '@/utils/multiversx/requestHandler'
import { NEARAccountHandler } from '@/utils/near/accountHandler'
import { NEARRequestHandler } from '@/utils/near/requestHandler'
import { SolanaRequestHandler } from '@/utils/solana/requestHandler'

type RequestHandler =
  | EVMRequestHandler
  | SolanaRequestHandler
  | MultiversXRequestHandler
  | NEARRequestHandler

function createRequestHandler(accountHandler: AccountHandler) {
  switch (accountHandler.chainType) {
    case ChainType.multiversx_cv25519:
      return new MultiversXRequestHandler(
        accountHandler as MultiversXAccountHandler
      )
    case ChainType.near_cv25519:
      return new NEARRequestHandler(accountHandler as NEARAccountHandler)
    case ChainType.solana_cv25519:
      return new SolanaRequestHandler(accountHandler as SolanaAccountHandler)
    default:
      return new EVMRequestHandler(accountHandler as EVMAccountHandler)
  }
}

export {
  createRequestHandler,
  type SolanaRequestHandler,
  type EVMRequestHandler,
  type RequestHandler,
}
