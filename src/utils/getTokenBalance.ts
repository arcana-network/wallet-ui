import { ethers } from 'ethers'

import ABI from '@/abis/erc20abi.json'
import { AccountHandler } from '@/utils/accountHandler'

type TokenBalanceParams = {
  privateKey: string
  rpcUrl: string
  walletAddress: string
  contractAddress: string
}

async function getTokenBalance(data: TokenBalanceParams): Promise<string> {
  const accountHandler = new AccountHandler(data.privateKey)
  const ethersContract = new ethers.Contract(
    data.contractAddress,
    ABI,
    accountHandler.provider
  )

  const balance = await ethersContract.balanceOf(data.walletAddress)

  return balance.toString()
}

export default getTokenBalance
