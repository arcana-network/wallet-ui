import axios from 'axios'

const TOKEN_REGISTRY_URL =
  'https://cdn.jsdelivr.net/gh/solana-labs/token-list@main/src/tokens/solana.tokenlist.json'

const TOKEN_REGISTRY_URL_FALLBACK =
  'https://raw.githubusercontent.com/solana-labs/token-list/main/src/tokens/solana.tokenlist.json'

type TokenInfo = {
  chainId: 101 | 102 | 103
  address: string
  symbol: string
  name: string
  decimals: number
  logoURI: string
  tags: string[]
}

async function fetchTokens() {
  try {
    const tokens = await axios.get(TOKEN_REGISTRY_URL)
    if (tokens?.data?.tokens?.length === 0) {
      throw new Error('Token list is empty')
    }
    return tokens.data.tokens as TokenInfo[]
  } catch (e) {
    try {
      const tokens = await axios.get(TOKEN_REGISTRY_URL_FALLBACK)
      if (tokens?.data?.tokens?.length === 0) {
        return []
      }
      return tokens.data.tokens as TokenInfo[]
    } catch (e) {
      throw new Error('Failed to fetch token list')
    }
  }
}
class SPLTokenRegistry {
  private splTokens: Map<string, TokenInfo>

  constructor(tokens: Map<string, TokenInfo>) {
    this.splTokens = tokens
  }

  static async create() {
    const tokens = await fetchTokens()
    const map = new Map<string, TokenInfo>()
    tokens.forEach((item) => {
      map.set(item.address, item)
    })
    return new SPLTokenRegistry(map)
  }

  get(address: string) {
    return this.splTokens.get(address)
  }
}

export { SPLTokenRegistry }
