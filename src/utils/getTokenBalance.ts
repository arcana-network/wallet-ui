import { ethers } from 'ethers'

import ABI from '@/abi.json'
import { AccountHandler } from '@/utils/accountHandler'

async function getTokenBalance(
  privateKey: string,
  walletAddress: string,
  contractAddress: string
): Promise<string> {
  const accountHandler = new AccountHandler(privateKey)
  const ethersContract = new ethers.Contract(
    contractAddress,
    ABI,
    accountHandler.provider
  )

  const balance = await ethersContract.balanceOf(walletAddress)

  return balance.toString()
}

export default getTokenBalance
