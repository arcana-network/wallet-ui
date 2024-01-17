import { RpcConfig } from '@arcana/auth'

interface RpcConfigWallet extends RpcConfig {
  favicon: string
  isCustom: boolean
  chainType?: string
  compatibility?: string
}

const CHAIN_LIST = [
  {
    chainId: '1',
    rpcUrls: ['https://cloudflare-eth.com'],
    chainName: 'Ethereum Mainnet',
    blockExplorerUrls: ['https://etherscan.io'],
    favicon: 'ethereum-icon',
    isCustom: false,
    nativeCurrency: {
      symbol: 'ETH',
      decimals: 18,
    },
  },
  {
    chainId: '5',
    rpcUrls: ['https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
    chainName: 'Ethereum Goerli (Testnet)',
    blockExplorerUrls: ['https://goerli.etherscan.io'],
    favicon: 'ethereum-icon',
    isCustom: false,
    nativeCurrency: {
      symbol: 'ETH',
      decimals: 18,
    },
  },
  {
    chainId: '137',
    rpcUrls: ['https://polygon-rpc.com'],
    chainName: 'Polygon Mainnet',
    blockExplorerUrls: ['https://polygonscan.com'],
    favicon: 'polygon-icon',
    isCustom: false,
    nativeCurrency: {
      symbol: 'MATIC',
      decimals: 18,
    },
  },
  {
    chainId: '80001',
    rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
    chainName: 'Polygon Mumbai (Testnet)',
    blockExplorerUrls: ['https://mumbai.polygonscan.com'],
    favicon: 'polygon-icon',
    isCustom: false,
    nativeCurrency: {
      symbol: 'MATIC',
      decimals: 18,
    },
  },
  {
    chainId: '11155111',
    rpcUrls: ['https://rpc.sepolia.org'],
    chainName: 'Sepolia (Testnet)',
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
    favicon: 'ethereum-icon',
    isCustom: false,
    nativeCurrency: {
      symbol: 'ETH',
      decimals: 18,
    },
  },
]

const DEFAULT_CHAIN_ID = '1'

export type { RpcConfigWallet }
export { CHAIN_LIST, DEFAULT_CHAIN_ID }
