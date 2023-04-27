type NFTContractType = 'erc721' | 'erc1155'

type NFTContract = {
  type: NFTContractType
  address: string
  tokenId: string
  collectionName: string
  name: string
  description?: string
  imageUrl: string
  animationUrl?: string
  attributes?: {
    trait: string
    value: string
  }[]
  tokenUrl: string
  autodetected?: boolean
}

type NFT = NFTContract & { balance?: number }

export type { NFTContract, NFTContractType, NFT }
