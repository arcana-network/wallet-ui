import { ethers } from 'ethers'

import ABI from '@/abis/erc20abi.json'
import { AccountHandler } from '@/utils/accountHandler'

type ContractParams = {
  privateKey: string
  rpcUrl: string
  walletAddress: string
  contractAddress: string
}

type SymbolDecimalResponse = {
  symbol: string
  decimals: number
}

async function getTokenBalance(data: ContractParams): Promise<string> {
  const accountHandler = new AccountHandler(data.privateKey, data.rpcUrl)
  const ethersContract = new ethers.Contract(
    data.contractAddress,
    ABI,
    accountHandler.provider
  )

  const balance = await ethersContract.balanceOf(data.walletAddress)

  return balance.toString()
}

async function getTokenSymbolAndDecimals(
  data: Omit<ContractParams, 'walletAddress'>
): Promise<SymbolDecimalResponse> {
  const accountHandler = new AccountHandler(data.privateKey, data.rpcUrl)
  const ethersContract = new ethers.Contract(
    data.contractAddress,
    ABI,
    accountHandler.provider
  )

  const symbolPromise: Promise<string> = ethersContract.symbol()
  const decimalsPromise: Promise<number> = ethersContract.decimals()

  const [symbol, decimals] = await Promise.all([symbolPromise, decimalsPromise])

  console.log({ symbol, decimals })

  return {
    symbol,
    decimals,
  }
}

export { getTokenBalance, getTokenSymbolAndDecimals }
