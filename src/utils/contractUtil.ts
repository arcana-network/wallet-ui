import { getAddress, createPublicClient, http } from 'viem'

import { ERC20 } from '@/abis/erc20.abi'
import { EVMAccountHandler } from '@/utils/accountHandler'
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
  const accountHandler =
    getRequestHandler().getAccountHandler() as EVMAccountHandler
  const client = accountHandler.client
  const balance = await client.readContract({
    abi: ERC20,
    functionName: 'balanceOf',
    address: getAddress(data.contractAddress),
    args: [getAddress(data.walletAddress)],
  })
  // const ethersContract = new ethers.Contract(
  //   data.contractAddress,
  //   ABI,
  //   accountHandler.provider
  // )

  // const balance = await ethersContract.balanceOf(data.walletAddress)

  return Number(balance as bigint).toString()
}

async function getTokenSymbolAndDecimals(
  data: Omit<ContractParams, 'walletAddress'>
): Promise<SymbolDecimalResponse> {
  const accountHandler =
    getRequestHandler().getAccountHandler() as EVMAccountHandler
  const client = accountHandler.client

  const symbolPromise = client.readContract({
    address: getAddress(data.contractAddress),
    abi: ERC20,
    functionName: 'symbol',
  })

  const decimalsPromise = client.readContract({
    address: getAddress(data.contractAddress),
    abi: ERC20,
    functionName: 'decimals',
  })

  const [symbol, decimals] = await Promise.all([symbolPromise, decimalsPromise])

  return {
    symbol,
    decimals,
  }
}

export { getTokenBalance, getTokenSymbolAndDecimals }
