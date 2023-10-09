import type { InitParams } from '@arcana/auth-core/types/types'

import type { CurrencySymbol } from '@/services/exchangeRate.service'

const DOCS_URL = process.env.VUE_APP_ARCANA_DOCS_URL
const HIDE_ON_RAMP = process.env.VUE_APP_HIDE_ON_RAMP
const AUTH_URL = process.env.VUE_APP_WALLET_AUTH_URL
const GATEWAY_URL = process.env.VUE_APP_WALLET_GATEWAY
const AUTH_NETWORK = process.env
  .VUE_APP_ARCANA_AUTH_NETWORK as InitParams['network']
const EXCHANGE_RATE_CURRENCY: CurrencySymbol = 'USD'
const GAS_FEE_UNIT = 'Gwei'
const GAS_PRICE_SPEED_MAP = {
  slow: { wait: 'safeLowWait', price: 'safeLow' },
  standard: { wait: 'avgWait', price: 'average' },
  fast: { wait: 'fastWait', price: 'fast' },
}
const TOAST_TIME_OUT = 5000
const SESSION_EXPIRY_MS = 30 * 60 * 1000

const PREDEFINED_ERC20_TOKENS = {
  1: [
    {
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
      logo: 'usdt.svg',
    },
    {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      logo: 'usdc.svg',
    },
    {
      address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
      name: 'Matic Token',
      symbol: 'MATIC',
      decimals: 18,
      logo: 'matic-network-logo.svg',
    },
    {
      address: '0x4Fabb145d64652a948d72533023f6E7A623C7C53',
      name: 'Binance USD',
      symbol: 'BUSD',
      decimals: 18,
      logo: 'busd.svg',
    },
  ],
  137: [
    {
      address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
      logo: 'usdt.svg',
    },
    {
      address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      name: 'USD Coin (PoS)',
      symbol: 'USDC.e',
      decimals: 6,
      logo: 'usdc.svg',
    },
    {
      address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
      name: 'Wrapped ETH',
      symbol: 'WETH',
      decimals: 18,
      logo: 'https://polygonscan.com/token/images/wETH_32.png',
    },
    {
      address: '0xdAb529f40E671A1D4bF91361c21bf9f0C9712ab7',
      name: 'Binance USD',
      symbol: 'BUSD',
      decimals: 18,
      logo: 'busd.svg',
    },
    {
      address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      logo: 'usdc.svg',
    },
  ],
  42161: [
    {
      address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
      logo: 'usdt.svg',
    },
    {
      address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
      name: 'Bridged USDC',
      symbol: 'USDC.e',
      decimals: 6,
      logo: 'usdc.svg',
    },
    {
      address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      logo: 'usdc.svg',
    },
    {
      address: '0x912CE59144191C1204E64559FE8253a0e49E6548',
      name: 'Arbitrum Token',
      symbol: 'ARB',
      decimals: 18,
      logo: 'https://arbiscan.io/token/images/arbitrumone2_32_new.png',
    },
  ],
}

export {
  SESSION_EXPIRY_MS,
  DOCS_URL,
  HIDE_ON_RAMP,
  AUTH_URL,
  GATEWAY_URL,
  AUTH_NETWORK,
  EXCHANGE_RATE_CURRENCY,
  GAS_FEE_UNIT,
  GAS_PRICE_SPEED_MAP,
  TOAST_TIME_OUT,
  PREDEFINED_ERC20_TOKENS,
}
