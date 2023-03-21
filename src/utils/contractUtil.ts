import { ethers } from 'ethers'

import ABI from '@/abis/erc20.abi.json'
import { getRequestHandler } from '@/utils/requestHandlerSingleton'

type ContractParams = {
  walletAddress: string
  contractAddress: string
}

type SymbolDecimalResponse = {
  symbol: string
  decimals: number
}

async function getTokenBalance(data: ContractParams): Promise<string> {
  const accountHandler = getRequestHandler().getAccountHandler()
  return (
    await accountHandler.getTokenBalance(
      data.contractAddress,
      data.walletAddress
    )
  ).toString()
}

async function getTokenSymbolAndDecimals(
  data: Omit<ContractParams, 'walletAddress'>
): Promise<SymbolDecimalResponse> {
  const accountHandler = getRequestHandler().getAccountHandler()

  const symbolPromise = accountHandler.getTokenSymbol(data.contractAddress)
  const decimalsPromise = accountHandler.getTokenDecimals(data.contractAddress)

  const [symbol, decimals] = await Promise.all([symbolPromise, decimalsPromise])

  return {
    symbol,
    decimals,
  }
}

export { getTokenBalance, getTokenSymbolAndDecimals }
