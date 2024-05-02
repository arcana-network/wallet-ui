import axios from 'axios'
import Pusher from 'pusher-js'

import { store } from '@/store'
import { useActivitiesStore } from '@/store/activities'
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
const transakSellableCryptos = [] as any[]
const transakSupportedCryptos = [] as any[]
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
      `${process.env.VUE_APP_WALLET_AUTH_URL}/${appStore.id}/sell/transak`
    )
    transakUrl.searchParams.append('partnerCustomerId', userStore.walletAddress)
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
    if (appStore.chainType === ChainType.multiversx_cv25519) {
      supportedCurrencies
        .filter((r) => r.uniqueId?.toLowerCase().includes('multiversx'))
        .forEach((currency) => {
          transakSupportedNetworks.push({
            chainId: isStaging ? 3 : 1,
            value: currency.network.name,
          })
        })
    } else if (appStore.chainType === ChainType.solana_cv25519) {
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
          transakSupportedCryptos.push(currency)
          if (currency.isPayInAllowed) {
            transakSellableCryptos.push(currency)
          }
        }
      })
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

function getTransakSellableCryptos() {
  return transakSellableCryptos
}

function getTransakSupportedCryptos() {
  return transakSupportedCryptos
}

const TransakStatus = {
  AWAITING_PAYMENT_FROM_USER: 'Unapproved',
  PROCESSING: 'Processing',
  PENDING_DELIVERY_FROM_TRANSAK: 'Pending',
  COMPLETED: 'Success',
  CANCELLED: 'Cancelled',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
  EXPIRED: 'Expired',
}

const CompletedTransakStatus = [
  'COMPLETED',
  'CANCELLED',
  'FAILED',
  'REFUNDED',
  'EXPIRED',
]

function subscribeTransakOrderId(orderId: string, chainId: string) {
  const activitiesStore = useActivitiesStore()
  const pusher = getTransakPusherChannel()

  const channel = pusher.subscribe(orderId)
  const events = Object.keys(TransakStatus)
  events.forEach((event) => {
    channel.bind(event, (ev) => {
      const activityIndex = activitiesStore
        .activities(Number(chainId))
        .findIndex((activity) => {
          return (
            activity.operation === 'Sell' &&
            activity.sellDetails?.orderId === orderId
          )
        })
      if (activityIndex !== -1) {
        activitiesStore.activitiesByChainId[Number(chainId)][
          activityIndex
        ].status = TransakStatus[event]
        if (ev.transactionHash) {
          activitiesStore.activitiesByChainId[Number(chainId)][
            activityIndex
          ].txHash = ev.transactionHash
        }
        if (ev.transactionLink) {
          activitiesStore.activitiesByChainId[Number(chainId)][
            activityIndex
          ].explorerUrl = ev.transactionLink
        }
        if (CompletedTransakStatus.includes(event)) {
          pusher.unsubscribe(orderId)
        }
      }
    })
  })
}

function unsubscribeTransakOrderId(orderId: string) {
  const pusher = getTransakPusherChannel()
  pusher.unsubscribe(orderId)
}

function getTransakPusherChannel() {
  const pusher = new Pusher(process.env.VUE_APP_TRANSAK_PUSHER_ID, {
    cluster: 'ap2',
  })

  return pusher
}

export {
  openTransak,
  fetchTransakNetworks,
  getTransakSupportedNetworks,
  getTransakSellableNetworks,
  getTransakSellableCryptos,
  getTransakSupportedCryptos,
  subscribeTransakOrderId,
  unsubscribeTransakOrderId,
  getTransakPusherChannel,
  TransakStatus,
  type TransakNetwork,
}
