import { ethers } from 'ethers'

import ABI from '@/abis/erc721.abi.json'
import { getAccountHandler } from '@/utils/accountHandler'

type ContractParams = {
  tokenId: string
  contractAddress: string
}

async function checkOwner(data: ContractParams): Promise<string> {
  const accountHandler = getAccountHandler()
  const ethersContract = new ethers.Contract(
    data.contractAddress,
    ABI,
    accountHandler.provider
  )

  const owner = await ethersContract.ownerOf(data.tokenId)
  console.log({ owner })
  const name = await ethersContract.name()
  console.log({ name })
  const tokenURI = await ethersContract.tokenURI(data.tokenId)
  console.log({ tokenURI })

  return ''
}

export { checkOwner }
