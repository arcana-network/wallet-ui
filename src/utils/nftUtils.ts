import { ethers } from 'ethers'

import erc1155abi from '@/abis/erc1155.abi.json'
import erc721abi from '@/abis/erc721.abi.json'
import { NFTContractType } from '@/models/NFT'
import { useUserStore } from '@/store/user'
import { getRequestHandler } from '@/utils/requestHandlerSingleton'

type ContractParams = {
  tokenId: string
  contractAddress: string
}

async function getERCStandard(address): Promise<NFTContractType | undefined> {
  const accountHandler = getRequestHandler().getAccountHandler()
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

  if (await contract.supportsInterface(ERC721InterfaceId))
    return NFTContractType.ERC721
  else if (await contract.supportsInterface(ERC1155InterfaceId))
    return NFTContractType.ERC1155
  return undefined
}

function get721Contract(contractAddress: string) {
  const accountHandler = getRequestHandler().getAccountHandler()
  return new ethers.Contract(
    contractAddress,
    erc721abi,
    accountHandler.provider
  )
}

function get1155Contract(contractAddress: string) {
  const accountHandler = getRequestHandler().getAccountHandler()
  return new ethers.Contract(
    contractAddress,
    erc1155abi,
    accountHandler.provider
  )
}

async function get721Uri(data: ContractParams): Promise<string> {
  const erc721Contract = get721Contract(data.contractAddress)
  return await erc721Contract.tokenURI(data.tokenId)
}

async function get1155Uri(data: ContractParams): Promise<string> {
  const erc1155Contract = get1155Contract(data.contractAddress)
  return await erc1155Contract.uri(data.tokenId)
}

async function getTokenUri(ercStandard: NFTContractType, data: ContractParams) {
  if (ercStandard === NFTContractType.ERC721) {
    return get721Uri(data)
  } else if (ercStandard === NFTContractType.ERC1155) {
    return get1155Uri(data)
  }
  return undefined
}

async function getCollectionName(contractAddress: string) {
  const erc721Contract = get721Contract(contractAddress)
  return await erc721Contract.name()
}

async function check721Ownership(data: ContractParams, walletAddress: string) {
  const erc721Contract = get721Contract(data.contractAddress)
  const ownerOfToken = await erc721Contract.ownerOf(data.tokenId)
  if (ownerOfToken === walletAddress) {
    return {
      owner: true,
      balance: 1,
    }
  }
  return {
    owner: false,
    balance: 0,
  }
}

async function check1155Ownership(data: ContractParams, walletAddress: string) {
  const erc1155Contract = get1155Contract(data.contractAddress)
  const balance = (
    await erc1155Contract.balanceOf(walletAddress, data.tokenId)
  ).toNumber()
  if (balance > 0) {
    return {
      owner: true,
      balance: Number(balance),
    }
  }
  return {
    owner: false,
    balance: 0,
  }
}

async function checkOwnership(
  ercStandard: NFTContractType,
  data: ContractParams
) {
  const userStore = useUserStore()
  const walletAddress = userStore.walletAddress

  if (ercStandard === NFTContractType.ERC721) {
    return await check721Ownership(data, walletAddress)
  } else if (ercStandard === NFTContractType.ERC1155) {
    return await check1155Ownership(data, walletAddress)
  }
  return {
    owner: false,
    balance: 0,
  }
}

export { getTokenUri, getERCStandard, getCollectionName, checkOwnership }
