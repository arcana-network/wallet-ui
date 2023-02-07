import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk'
import { IHostConfig } from '@ramp-network/ramp-instant-sdk/dist/types/types'

import { store } from '@/store'
import { useUserStore } from '@/store/user'

const userStore = useUserStore(store)

async function openRampSdk() {
  const rampSdkParams: IHostConfig = {
    hostAppName: 'Arcana OnRamp',
    hostLogoUrl:
      'https://uploads-ssl.webflow.com/63aa7f8ce3b3be42ed4f4a3f/63c1115844d4cffb40ebf7d3_favicon-32x32.png',
    hostApiKey: process.env.VUE_APP_RAMP_API_KEY,
    // swapAsset: 'ETH_ETH',
    enabledFlows: ['ONRAMP'],
    userAddress: userStore.walletAddress,
    userEmailAddress: userStore.info.email || '',
  }
  if (process.env.VUE_APP_RAMP_ENV === 'STAGING') {
    rampSdkParams.url = 'https://app.demo.ramp.network'
  }
  new RampInstantSDK(rampSdkParams)
    .on('*', (event) => console.log(event))
    .show()
}

export { openRampSdk }
