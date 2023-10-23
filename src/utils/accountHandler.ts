import { EVMAccountHandler } from '@/utils/evm/accountHandler'
import { SolanaAccountHandler } from '@/utils/solana/accountHandler'

type SupportedChainTypes = 'evm' | 'solana'

type AccountHandler = EVMAccountHandler | SolanaAccountHandler

function CreateAccountHandler(
  privateKey: string,
  rpcUrl: string,
  chainType: SupportedChainTypes = 'evm'
): AccountHandler {
  if (chainType === 'solana') {
    return new SolanaAccountHandler(Buffer.from(privateKey), rpcUrl)
  }
  return new EVMAccountHandler(privateKey, rpcUrl)
}

export {
  CreateAccountHandler,
  type EVMAccountHandler,
  type SolanaAccountHandler,
  type AccountHandler,
  type SupportedChainTypes,
}
