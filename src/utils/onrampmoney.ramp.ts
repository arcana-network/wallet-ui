import axios from 'axios'

import { useUserStore } from '@/store/user'

class OnRampMoneyException extends Error {}

type OnRampMoneyCoinObject = {
  // defined manually
  actualID: string

  coinId: number
  coinName: string
  coinIcon: string
  balanceFloatPlaces: number
  tradeFloatPlaces: number
  markets: {
    decimals: {
      usdt: number
      inr: number
    }
  }
  networks: number[]
}

type OnRampMoneyNetworkObject = {
  chainSymbol: string
  chainName: string
  networkId: number
  nativeToken: number
}

// Chain ID -> Coin ID -> token object (?)
const CHAIN_ID_TOKEN_IDS_MAP = new Map<
  number,
  Map<number, OnRampMoneyCoinObject>
>()
const CHAIN_ID_CONFIG = new Map<number, OnRampMoneyNetworkObject>()
const API_URL = new URL(
  '/api/v1/onramp-coin-config',
  process.env.VUE_APP_WALLET_GATEWAY
).href

async function initializeOnRampMoney() {
  const resp = await axios({
    method: 'GET',
    url: API_URL,
  })

  const allCoinConfig = resp.data.data.allCoinConfig as OnRampMoneyCoinObject[]
  for (const [actualID, coin] of Object.entries(allCoinConfig)) {
    coin.actualID = actualID
    for (const network of coin.networks) {
      let tMap = CHAIN_ID_TOKEN_IDS_MAP.get(network)
      if (tMap == null) {
        tMap = new Map<number, OnRampMoneyCoinObject>()
        CHAIN_ID_TOKEN_IDS_MAP.set(network, tMap)
      }
      tMap.set(coin.coinId, coin)
    }
  }

  const netConfigs = resp.data.data.networkConfig as OnRampMoneyNetworkObject[]
  for (const netConfig of netConfigs) {
    CHAIN_ID_CONFIG.set(netConfig.networkId, netConfig)
  }
}

function isSupportedByOnRampMoney(chainId: number) {
  return CHAIN_ID_CONFIG.has(chainId)
}

async function openOnRampMoneyHostedUI(chainId: number) {
  const netConfig = CHAIN_ID_CONFIG.get(chainId)
  if (netConfig == null) {
    throw new OnRampMoneyException('Unsupported chain')
  }
  const nativeToken = CHAIN_ID_TOKEN_IDS_MAP.get(chainId)?.get(
    netConfig.nativeToken
  )
  if (nativeToken == null) {
    // should not be possible
    throw new OnRampMoneyException()
  }
  const uStore = useUserStore()

  const baseURL = new URL(process.env.VUE_APP_ON_RAMP_MONEY_URL)
  baseURL.searchParams.set('network', netConfig.chainSymbol)
  baseURL.searchParams.set('coinCode', nativeToken.actualID)
  baseURL.searchParams.set('walletAddress', uStore.walletAddress)
  window.open(baseURL.href, '_blank')
}

export {
  initializeOnRampMoney,
  openOnRampMoneyHostedUI,
  isSupportedByOnRampMoney,
}
