import transakSDK from '@transak/transak-sdk'

import { store } from '@/store'
import { useUserStore } from '@/store/user'

const userStore = useUserStore(store)

export async function openTransak() {
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
