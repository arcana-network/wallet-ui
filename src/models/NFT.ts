type NFTContractType = 'erc721' | 'erc1155' | 'mpl'

type NFTContract = {
  type: NFTContractType
  address: string
  tokenId: string
  collectionName: string
  name: string
  description?: string
  imageUrl?: string
  animationUrl?: string
  attributes?: {
    trait: string
    value: string
  }[]
  tokenUrl: string
  autodetected?: boolean
  identifier?: string
  nonce?: number
}

type NFT = NFTContract & { balance?: number }

export type { NFTContract, NFTContractType, NFT }
