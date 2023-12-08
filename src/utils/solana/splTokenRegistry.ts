import { TokenInfo, TokenListProvider } from '@solana/spl-token-registry'

class SPLTokenRegistry {
  private splTokens: Map<string, TokenInfo>

  constructor(tokens: Map<string, TokenInfo>) {
    this.splTokens = tokens
  }

  static async create() {
    const tokens = await new TokenListProvider().resolve()
    const mappedTokens = tokens.getList().reduce((map, item) => {
      map.set(item.address, item)
      return map
    }, new Map<string, TokenInfo>())
    return new SPLTokenRegistry(mappedTokens)
  }

  get(address: string) {
    return this.splTokens.get(address)
  }
}

export { SPLTokenRegistry }
