import axios from 'axios'

import type { NFT } from '@/models/NFT'
import type { StorageWrapper } from '@/utils/storageWrapper'

const NFT_DB_KEY = 'nft_list'
const NFT_PAGE_SIZE = 50

type NFTItem = NFT & {
  autodetected: boolean
  chainId: number
}

type AnkrTrait = {
  trait_type: string
  value: string
}

type AnkrNFT = {
  blockchain: string
  collectionName: string
  contractAddress: string
  contractType: string
  imageUrl: string
  name: string
  quantity: string
  symbol: string
  tokenId: string
  tokenUrl: string
  animationUrl?: string
  traits?: AnkrTrait[]
  nextPageToken: string
}

const ANKR_BLOCKCHAIN_TO_CHAIN_ID = new Map([
  ['arbitrum', 42161],
  ['avalanche', 43114],
  ['avalanche_fuji', 43113],
  ['bsc', 56],
  ['eth', 1],
  ['eth_goerli', 5],
  ['fantom', 250],
  ['optimism', 10],
  ['polygon', 137],
  ['polygon_mumbai', 80001],
  ['syscoin', 57],
])

class NFTDB {
  private readonly storage: StorageWrapper
  private readonly walletAddress: string
  public list: NFTItem[]

  static async create(storage: StorageWrapper, walletAddress: string) {
    let existingNfts: NFTItem[]
    const realKey = `${walletAddress}-${NFT_DB_KEY}`

    const nftsInStorage = storage.getItem(realKey)
    existingNfts = nftsInStorage ? JSON.parse(nftsInStorage) : []
    existingNfts = existingNfts.filter((nft) => !nft.autodetected)

    try {
      let npToken: null | boolean | string = null
      while (npToken !== false) {
        const resp = await axios({
          method: 'POST',
          baseURL: process.env.VUE_APP_ANKR_PREMIUM_API_URL,
          url: '',
          params: {
            ankr_getNFTsByOwner: '',
          },
          data: {
            id: 1,
            jsonrpc: '2.0',
            method: 'ankr_getNFTsByOwner',
            params: {
              blockchain: Array.from(ANKR_BLOCKCHAIN_TO_CHAIN_ID.keys()),
              walletAddress,
              pageSize: NFT_PAGE_SIZE,
              pageToken:
                npToken != null || npToken != false ? npToken : undefined,
            },
          },
        })

        const result = resp.data.result?.assets as AnkrNFT[]
        for (const r of result) {
          let contractType

          switch (r.contractType) {
            case 'ERC721':
              contractType = 'erc721'
              break
            case 'ERC1155':
              contractType = 'erc1155'
              break
            default:
              continue
          }
          const chainId = ANKR_BLOCKCHAIN_TO_CHAIN_ID.get(r.blockchain)
          if (chainId == null) {
            continue
          }

          existingNfts.push({
            type: contractType,
            address: r.contractAddress,
            tokenId: r.tokenId,
            collectionName: r.collectionName,
            name: r.name,
            imageUrl: r.imageUrl,
            attributes: r.traits?.map((k) => ({
              trait: k.trait_type,
              value: k.value,
            })),
            autodetected: true,
            chainId,
            tokenUrl: r.tokenUrl,
            balance: r.quantity ? Number(r.quantity) : undefined,
          })
        }
        npToken =
          resp.data.result?.nextPageToken == ''
            ? false
            : resp.data.result.nextPageToken
      }
    } catch (e) {
      console.error('Caught error while trying to get NFTs:', e)
    }

    storage.setItem(realKey, JSON.stringify(existingNfts))

    return new NFTDB(storage, walletAddress, existingNfts)
  }

  constructor(
    storage: StorageWrapper,
    walletAddress: string,
    initialList: NFTItem[]
  ) {
    this.storage = storage
    this.list = initialList
    this.walletAddress = walletAddress
  }

  private get storageKey() {
    return `${this.walletAddress}-${NFT_DB_KEY}`
  }

  private synchronizeToStorage() {
    this.storage.setItem(this.storageKey, JSON.stringify(this.list))
  }

  public getNFTs(chainId: number): NFTItem[] {
    return this.list.filter((x) => x.chainId == chainId)
  }

  public addNFT(item: NFT, chainId: number) {
    const index = this.list.findIndex((x) => {
      return (
        x.chainId === chainId &&
        x.address.toLowerCase() === item.address.toLowerCase() &&
        x.tokenId === item.tokenId
      )
    })
    if (index !== -1) {
      throw new Error('NFT already exists')
    }
    this.list.push({
      ...item,
      autodetected: false,
      chainId,
      tokenUrl: '',
    })
    this.synchronizeToStorage()
  }

  public updateNFT(item: NFT, chainId) {
    const act = this.list.find((x) => {
      return (
        x.chainId === chainId &&
        x.address.toLowerCase() === item.address.toLowerCase() &&
        x.tokenId === item.tokenId
      )
    })
    if (act == null) {
      throw new Error('Could not find the relevant NFT')
    }
    for (const k of Object.keys(item)) {
      act[k] = item[k]
    }
    this.synchronizeToStorage()
  }

  public removeNFT(item: NFT, chainId: number) {
    const index = this.list.findIndex((x) => {
      return (
        x.chainId === chainId &&
        x.address.toLowerCase() === item.address.toLowerCase() &&
        x.tokenId === item.tokenId
      )
    })
    if (index === -1) {
      throw new Error('Could not find the relevant NFT')
    }
    this.list.splice(index, 1)
    this.synchronizeToStorage()
  }
}

export { NFTDB }
