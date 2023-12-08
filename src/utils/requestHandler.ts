import {
  AccountHandler,
  EVMAccountHandler,
  SolanaAccountHandler,
} from '@/utils/accountHandler'
import { ChainType } from '@/utils/chainType'
import { EVMRequestHandler } from '@/utils/evm/requestHandler'
import { SolanaRequestHandler } from '@/utils/solana/requestHandler'

type RequestHandler = EVMRequestHandler | SolanaRequestHandler

function createRequestHandler(accountHandler: AccountHandler) {
  if (accountHandler.chainType === ChainType.solana_cv25519) {
    return new SolanaRequestHandler(accountHandler as SolanaAccountHandler)
  } else {
    return new EVMRequestHandler(accountHandler as EVMAccountHandler)
  }
}

export {
  createRequestHandler,
  type SolanaRequestHandler,
  type EVMRequestHandler,
  type RequestHandler,
}
