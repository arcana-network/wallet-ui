import axios from 'axios'

import { store } from '@/store'
import { useUserStore } from '@/store/user'

const userStore = useUserStore(store)

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

  const supportedCurrencies = (
    await axios.get(`${TransakApi}/api/v2/currencies/crypto-currencies`)
  ).data?.response
  if (supportedCurrencies?.length) {
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

function getTransakSupportedNetworks() {
  return transakSupportedNetworks
}

export { openTransak, fetchTransakNetworks, getTransakSupportedNetworks }
