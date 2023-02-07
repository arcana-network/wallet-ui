import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk'

import { store } from '@/store'
import { useUserStore } from '@/store/user'

const userStore = useUserStore(store)

new RampInstantSDK({
  hostAppName: 'Arcana OnRamp',
  url: 'https://app.demo.ramp.network',
  hostLogoUrl:
    'https://uploads-ssl.webflow.com/63aa7f8ce3b3be42ed4f4a3f/63c1115844d4cffb40ebf7d3_favicon-32x32.png',
  hostApiKey: '8uh7t6jkkvg35e93g4xbdhsqkpzy7u7p74sqk3sy',
  swapAsset: 'ETH_ETH',
  enabledFlows: ['ONRAMP'],
  userAddress: userStore.walletAddress,
  userEmailAddress: userStore.info.email || '',
})
  .on('*', (event) => console.log(event))
  .show()
