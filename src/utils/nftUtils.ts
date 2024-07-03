import { PublicClient, getAddress, getContract } from 'viem'

import { ERC1155 } from '@/abis/erc1155.abi'
import { ERC721 } from '@/abis/erc721.abi'
import type { NFT, NFTContractType } from '@/models/NFT'
import { getNFTDetails, modifyIpfsUrl } from '@/services/getNFTDetails.service'
import { NFTDB } from '@/services/nft.service'
import { useUserStore } from '@/store/user'
import { EVMAccountHandler } from '@/utils/accountHandler'
import { getRequestHandler } from '@/utils/requestHandlerSingleton'

type ContractParams = {
  tokenId: string
  contractAddress: string
}

async function getERCStandard(address): Promise<NFTContractType | undefined> {
  const accountHandler =
    getRequestHandler().getAccountHandler() as EVMAccountHandler
  const client = accountHandler.client

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

  // const contract = new ethers.Contract(address, ERC165Abi, provider)
  const contract = getContract({
    address,
    abi: ERC165Abi,
    client,
  })
  //TODO: Check if it should be an array
  if (await contract.read.supportsInterface([ERC721InterfaceId]))
    return 'erc721'
  else if (await contract.read.supportsInterface([ERC1155InterfaceId]))
    return 'erc1155'
  return undefined
}

async function get721Uri(data: ContractParams): Promise<string> {
  const handler = getRequestHandler().getAccountHandler() as EVMAccountHandler
  const contract = getERC721Contract(
    getAddress(data.contractAddress),
    handler.client
  )
  return contract.read.tokenURI([data.tokenId])
}

function getERC1155Contract(address: `0x${string}`, client: PublicClient) {
  const contract = getContract({
    address,
    abi: ERC1155,
    client,
  })
  return contract
}
function getERC721Contract(address: `0x${string}`, client: PublicClient) {
  const contract = getContract({
    address,
    abi: ERC721,
    client,
  })
  return contract
}

async function get1155Uri(data: ContractParams): Promise<string> {
  const handler = getRequestHandler().getAccountHandler() as EVMAccountHandler
  const contract = getERC1155Contract(
    getAddress(data.contractAddress),
    handler.client
  )
  return contract.read.uri([data.tokenId])
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
  const handler = getRequestHandler().getAccountHandler() as EVMAccountHandler
  const contract = getERC721Contract(
    getAddress(contractAddress),
    handler.client
  )
  return contract.read.name()
}

async function check721Ownership(data: ContractParams, walletAddress: string) {
  const handler = getRequestHandler().getAccountHandler() as EVMAccountHandler
  const contract = getERC721Contract(
    getAddress(data.contractAddress),
    handler.client
  )
  const ownerOfToken = await contract.read.ownerOf([data.tokenId])
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
  const handler = getRequestHandler().getAccountHandler() as EVMAccountHandler
  const contract = getERC1155Contract(
    getAddress(data.contractAddress),
    handler.client
  )
  const balance = Number(
    contract.read.balanceOf([getAddress(walletAddress), data.tokenId])
  )

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

  if (ercStandard === 'erc721') {
    return await check721Ownership(data, walletAddress)
  } else if (ercStandard === 'erc1155') {
    return await check1155Ownership(data, walletAddress)
  }
  return {
    owner: false,
    balance: 0,
  }
}

function sanitizeUrl(url?: string) {
  if (url && url.startsWith('ipfs://')) {
    return modifyIpfsUrl(url)
  }
  return url
}

async function getDetailedNFTs(nftDB: NFTDB, chainId: number) {
  const potentialNFTList = nftDB.getNFTs(chainId)
  const nfts: NFT[] = []

  await Promise.all(
    potentialNFTList.map(async (nft) => {
      const [ownership, details] = await Promise.all([
        nft.autodetected
          ? undefined
          : checkOwnership(nft.type, {
              tokenId: nft.tokenId,
              contractAddress: nft.address,
            }),
        getNFTDetails(nft.tokenUrl, nft.tokenId),
      ])

      // Check for undefined because we don't want to remove the NFT if it's autodetected
      // Ownership is undefined if autodetected
      if (ownership !== undefined && !ownership.owner) {
        nftDB.removeNFT(nft, chainId)
        return
      }

      details.name = details?.name || `#${nft.tokenId}`
      details.imageUrl = sanitizeUrl(details?.image_url || details?.image)
      details.animationUrl = sanitizeUrl(
        details?.animation_url || details?.animations
      )
      nfts.push({ ...nft, ...details })
    })
  )

  return nfts
}

export {
  getTokenUri,
  getERCStandard,
  getCollectionName,
  checkOwnership,
  getDetailedNFTs,
}
