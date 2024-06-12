import { TokenInfo, TokenListProvider } from '@solana/spl-token-registry'

class SPLTokenRegistry {
  private splTokens: Map<string, TokenInfo>

  constructor(tokens: Map<string, TokenInfo>) {
    this.splTokens = tokens
  }

  static async create() {
    const tokens = await new TokenListProvider().resolve()
    const map = new Map<string, TokenInfo>()
    tokens.getList().forEach((item) => {
      map.set(item.address, item)
    })
    return new SPLTokenRegistry(map)
  }

  get(address: string) {
    return this.splTokens.get(address)
  }
}

export { SPLTokenRegistry }
