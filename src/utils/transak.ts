import axios from 'axios'

import { store } from '@/store'
import { useAppStore } from '@/store/app'
import { useUserStore } from '@/store/user'
import { ChainType } from '@/utils/chainType'
import { getWindowFeatures } from '@/utils/popupProps'

const userStore = useUserStore(store)
const appStore = useAppStore(store)

type TransakNetwork = {
  chainId: number
  value: string
}

const transakSupportedNetworks: TransakNetwork[] = []
const transakSellableNetworks: TransakNetwork[] = []
let isFetched = false

function openTransak(network: string, isSell?: boolean) {
  const Transak =
    process.env.VUE_APP_TRANSAK_ENV === 'STAGING'
      ? 'https://global-stg.transak.com'
      : 'https://global.transak.com'

  const transakUrl = new URL(Transak)
  transakUrl.searchParams.append('apiKey', process.env.VUE_APP_TRANSAK_API_KEY)
  transakUrl.searchParams.append('walletAddress', userStore.walletAddress)
  transakUrl.searchParams.append('email', userStore.info.email || '')
  transakUrl.searchParams.append('network', network)
  transakUrl.searchParams.append('themeColor', '#262626')
  if (isSell) {
    transakUrl.searchParams.append('productsAvailed', 'SELL')
    transakUrl.searchParams.append('walletRedirection', 'true')
    transakUrl.searchParams.append(
      'redirectURL',
      'https://verify.dev.arcana.network/sell/transak'
    )
  }

  window.open(transakUrl.toString(), '_blank', getWindowFeatures())
}

async function fetchTransakNetworks() {
  if (isFetched) return
  const TransakApi =
    process.env.VUE_APP_TRANSAK_ENV === 'STAGING'
      ? 'https://api-stg.transak.com'
      : 'https://api.transak.com'
  const isStaging = process.env.VUE_APP_TRANSAK_ENV === 'STAGING'
  transakSupportedNetworks.length = 0
  transakSellableNetworks.length = 0

  const supportedCurrencies = (
    await axios.get(`${TransakApi}/api/v2/currencies/crypto-currencies`)
  ).data?.response
  if (supportedCurrencies?.length) {
    if (appStore.chainType === ChainType.solana_cv25519) {
      supportedCurrencies
        .filter((r) => r.uniqueId?.toLowerCase().includes('solana'))
        .forEach((currency) => {
          if (currency.isAllowed) {
            transakSupportedNetworks.push({
              chainId: isStaging ? 3 : 1,
              value: currency.network.name,
            })
          }
          if (currency.isPayInAllowed) {
            transakSellableNetworks.push({
              chainId: isStaging ? 3 : 1,
              value: currency.network.name,
            })
          }
        })
    } else {
      supportedCurrencies.forEach((currency) => {
        if (currency.network?.chainId) {
          const chainId = Number(currency.network.chainId)
          if (
            !transakSupportedNetworks.find(
              (network) => Number(network.chainId) === Number(chainId)
            ) &&
            currency.isAllowed
          ) {
            transakSupportedNetworks.push({
              chainId,
              value: currency.network.name,
            })
          }
          if (
            !transakSellableNetworks.find(
              (network) => Number(network.chainId) === Number(chainId)
            ) &&
            currency.isPayInAllowed
          ) {
            transakSellableNetworks.push({
              chainId,
              value: currency.network.name,
            })
          }
        }
      })
      console.log(transakSupportedNetworks, transakSellableNetworks)
    }
  }
  isFetched = true
}

function getTransakSupportedNetworks() {
  return transakSupportedNetworks
}

function getTransakSellableNetworks() {
  return transakSellableNetworks
}

export {
  openTransak,
  fetchTransakNetworks,
  getTransakSupportedNetworks,
  getTransakSellableNetworks,
}
