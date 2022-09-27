import { RpcConfig } from '@arcana/auth'

interface RpcConfigWallet extends RpcConfig {
  favicon: string
}

const CHAIN_LIST = [
  {
    chainId: 1,
    rpcUrls: ['https://cloudflare-eth.com/'],
    chainName: 'Ethereum Mainnet',
    blockExplorerUrls: ['https://etherscan.io/'],
    favicon: 'ethereum-icon',
    nativeCurrency: {
      symbol: 'ETH',
      decimals: 18,
    },
  },
  {
    chainId: 3,
    rpcUrls: ['https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
    chainName: 'Ethereum Ropsten (Testnet)',
    blockExplorerUrls: ['https://ropsten.etherscan.io/'],
    favicon: 'ethereum-icon',
    nativeCurrency: {
      symbol: 'ETH',
      decimals: 18,
    },
  },
  {
    chainId: 4,
    rpcUrls: ['https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
    chainName: 'Ethereum Rinkeby (Testnet)',
    blockExplorerUrls: ['https://rinkeby.etherscan.io/'],
    favicon: 'ethereum-icon',
    nativeCurrency: {
      symbol: 'ETH',
      decimals: 18,
    },
  },
  {
    chainId: 5,
    rpcUrls: ['https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
    chainName: 'Ethereum Goerli (Testnet)',
    blockExplorerUrls: ['https://goerli.etherscan.io/'],
    favicon: 'ethereum-icon',
    nativeCurrency: {
      symbol: 'ETH',
      decimals: 18,
    },
  },
  {
    chainId: 137,
    rpcUrls: ['https://polygon-rpc.com'],
    chainName: 'Polygon Mainnet',
    blockExplorerUrls: ['https://polygonscan.com'],
    favicon: 'polygon-icon',
    nativeCurrency: {
      symbol: 'matic',
      decimals: 18,
    },
  },
  {
    chainId: 80001,
    rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
    chainName: 'Polygon Mumbai (Testnet)',
    blockExplorerUrls: ['https://mumbai-explorer.matic.today'],
    favicon: 'polygon-icon',
    nativeCurrency: {
      symbol: 'matic',
      decimals: 18,
    },
  },
  {
    chainId: 40405,
    rpcUrls: ['https://blockchain001-testnet.arcana.network/'],
    chainName: 'Arcana (Testnet)',
    blockExplorerUrls: ['https://explorer.beta.arcana.network/'],
    favicon: 'arcana-icon',
  },
  {
    chainId: 40404,
    rpcUrls: ['https://blockchain-dev.arcana.network'],
    chainName: 'Arcana Dev',
    blockExplorerUrls: ['https://explorer.dev.arcana.network/'],
    favicon: 'arcana-icon',
  },
]

const DEFAULT_CHAIN_ID = 40404

export type { RpcConfigWallet }
export { CHAIN_LIST, DEFAULT_CHAIN_ID }
