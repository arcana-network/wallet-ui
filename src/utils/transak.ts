import transakSDK from '@transak/transak-sdk'
import axios from 'axios'

import { store } from '@/store'
import { useUserStore } from '@/store/user'

const userStore = useUserStore(store)

type TransakNetwork = {
  chainId: number
  value: string
}

const transakSupportedNetworks: TransakNetwork[] = []

async function openTransak() {
  return new Promise((resolve) => {
    const transak = new transakSDK({
      apiKey: process.env.VUE_APP_TRANSAK_API_KEY,
      environment: process.env.VUE_APP_TRANSAK_ENV,
      walletAddress: userStore.walletAddress,
      email: userStore.info.email || '',
      network: 'ethereum',
    })

    transak.on(transak.ALL_EVENTS, (data) => {
      if (data.eventName === 'TRANSAK_ORDER_SUCCESSFUL') {
        resolve({ status: 'success', data: data.status })
      } else if (data.eventName === 'TRANSAK_ORDER_FAILED') {
        resolve({ status: 'failed', data: data.status })
      } else if (data.eventName === 'TRANSAK_ORDER_CANCELLED') {
        resolve({ status: 'cancelled', data: data.status })
      } else if (data.eventName === 'TRANSAK_WIDGET_CLOSE') {
        transak.close()
        resolve({ closed: true })
        return
      }
    })

    transak.init()
  })
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
    console.log(transakSupportedNetworks)
  }
}

function getTransakSupportedNetworks() {
  return transakSupportedNetworks
}

export { openTransak, fetchTransakNetworks, getTransakSupportedNetworks }
