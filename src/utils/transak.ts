import axios from 'axios'

import { store } from '@/store'
import { useAppStore } from '@/store/app'
import { useUserStore } from '@/store/user'
import { ChainType } from '@/utils/chainType'

const userStore = useUserStore(store)
const appStore = useAppStore(store)

type TransakNetwork = {
  chainId: number
  value: string
}

const transakSupportedNetworks: TransakNetwork[] = []

function openTransak(network: string) {
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

  window.open(transakUrl.toString(), '_blank')
}

async function fetchTransakNetworks() {
  const TransakApi =
    process.env.VUE_APP_TRANSAK_ENV === 'STAGING'
      ? 'https://api-stg.transak.com'
      : 'https://api.transak.com'
  const isStaging = process.env.VUE_APP_TRANSAK_ENV === 'STAGING'

  const supportedCurrencies = (
    await axios.get(`${TransakApi}/api/v2/currencies/crypto-currencies`)
  ).data?.response
  if (supportedCurrencies?.length) {
    if (appStore.chainType === ChainType.solana_cv25519) {
      supportedCurrencies
        .filter((r) => r.uniqueId?.toLowerCase().includes('solana'))
        .forEach((currency) => {
          transakSupportedNetworks.push({
            chainId: isStaging ? 3 : 1,
            value: currency.network.name,
          })
        })
    } else {
      supportedCurrencies.forEach((currency) => {
        if (currency.network?.chainId) {
          const chainId = Number(currency.network.chainId)
          if (
            !transakSupportedNetworks.find(
              (network) => network.chainId === chainId
            )
          ) {
            transakSupportedNetworks.push({
              chainId,
              value: currency.network.name,
            })
          }
        }
      })
    }
  }
}

function getTransakSupportedNetworks() {
  return transakSupportedNetworks
}

export { openTransak, fetchTransakNetworks, getTransakSupportedNetworks }
