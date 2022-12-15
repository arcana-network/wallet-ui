import { ethers } from 'ethers'

import erc1155abi from '@/abis/erc1155.abi.json'
import erc721abi from '@/abis/erc721.abi.json'
import type { NFTContractType } from '@/models/NFT'
import { getAccountHandler } from '@/utils/accountHandler'

type ContractParams = {
  tokenId: string
  contractAddress: string
}

async function getERCStandard(address): Promise<NFTContractType | undefined> {
  const accountHandler = getAccountHandler()
  const provider = accountHandler.provider

  const ERC165Abi = [
    {
      inputs: [
        {
          internalType: 'bytes4',
          name: 'interfaceId',
          type: 'bytes4',
        },
      ],
      name: 'supportsInterface',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ]

  const ERC1155InterfaceId = '0xd9b67a26'
  const ERC721InterfaceId = '0x80ac58cd'

  const contract = new ethers.Contract(address, ERC165Abi, provider)

  if (await contract.supportsInterface(ERC721InterfaceId)) return 'erc721'
  else if (await contract.supportsInterface(ERC1155InterfaceId))
    return 'erc1155'
  return undefined
}

async function get721Uri(data: ContractParams): Promise<string> {
  const accountHandler = getAccountHandler()
  const ethersContract = new ethers.Contract(
    data.contractAddress,
    erc721abi,
    accountHandler.provider
  )

  return await ethersContract.tokenURI(data.tokenId)
}

async function get1155Uri(data: ContractParams): Promise<string> {
  const accountHandler = getAccountHandler()
  const ethersContract = new ethers.Contract(
    data.contractAddress,
    erc1155abi,
    accountHandler.provider
  )

  return await ethersContract.uri(data.tokenId)
}

async function getTokenUri(ercStandard: NFTContractType, data: ContractParams) {
  if (ercStandard === 'erc721') {
    return get721Uri(data)
  } else if (ercStandard === 'erc1155') {
    return get1155Uri(data)
  }
  return undefined
}

async function getCollectionName(contractAddress: string) {
  const accountHandler = getAccountHandler()
  const ethersContract = new ethers.Contract(
    contractAddress,
    erc721abi,
    accountHandler.provider
  )

  return await ethersContract.name()
}

export { getTokenUri, getERCStandard, getCollectionName }
