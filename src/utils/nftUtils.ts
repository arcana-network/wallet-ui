import { ethers } from 'ethers'

import erc1155abi from '@/abis/erc1155.abi.json'
import erc721abi from '@/abis/erc721.abi.json'
import { getAccountHandler } from '@/utils/accountHandler'

type ContractParams = {
  tokenId: string
  contractAddress: string
}

async function checkOwner(data: ContractParams): Promise<string> {
  const accountHandler = getAccountHandler()
  const ethersContract = new ethers.Contract(
    data.contractAddress,
    erc1155abi,
    accountHandler.provider
  )

  const owner = await ethersContract.ownerOf(data.tokenId)
  console.log({ owner })
  const name = await ethersContract.name()
  console.log({ name })
  const tokenURI = await ethersContract.uri(data.tokenId)
  console.log({ tokenURI })

  return ''
}

export { checkOwner }
