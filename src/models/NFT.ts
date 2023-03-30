enum NFTContractType {
  ERC721,
  ERC1155,
  SOLANA_SPL,
}

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
}

type NFT = NFTContract & { balance?: number }

export { NFTContractType }
export type { NFTContract, NFT }
