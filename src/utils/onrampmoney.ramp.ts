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
  networkIDs: string[]
}

type OnRampMoneyNetworkObject = {
  chainSymbol: string
  chainName: string
  networkId: number
  nativeToken: number
}

const COIN_CONFIG = new Map<number, OnRampMoneyCoinObject>()
const CHAIN_ID_CONFIG = new Map<number, OnRampMoneyNetworkObject>()
const API_URL = new URL(
  '/api/v1/onramp-coin-config/',
  process.env.VUE_APP_WALLET_GATEWAY
).href

async function initializeOnRampMoney() {
  const resp = await axios({
    method: 'GET',
    url: API_URL,
  })

  const netConfigs = resp.data.data.networkConfig as Record<
    string,
    OnRampMoneyNetworkObject
  >
  for (const [key, netConfig] of Object.entries(netConfigs)) {
    CHAIN_ID_CONFIG.set(parseInt(key), netConfig)
  }

  const allCoinConfig = resp.data.data.allCoinConfig as OnRampMoneyCoinObject[]
  for (const [actualID, coin] of Object.entries(allCoinConfig)) {
    coin.actualID = actualID

    for (const net of coin.networks) {
      if (CHAIN_ID_CONFIG.has(net)) {
        const v = CHAIN_ID_CONFIG.get(net)
        if (v == null) {
          continue
        }
        coin.networkIDs.push(v.chainSymbol)
      }
    }

    COIN_CONFIG.set(coin.coinId, coin)
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
  const nativeToken = COIN_CONFIG.get(netConfig.nativeToken)
  if (nativeToken == null) {
    throw new OnRampMoneyException('Could not find native token')
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
