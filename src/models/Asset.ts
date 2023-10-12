type AssetContract = {
  address: string
  symbol: string
  decimals: number
  logo?: string
  name?: string
  image?: string
}

type EthAssetContract = AssetContract & {
  erc20: boolean
  erc721: boolean
}

type Asset = AssetContract & { balance: number }

export type { Asset, AssetContract, EthAssetContract }
