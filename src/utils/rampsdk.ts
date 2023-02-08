import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk'
import { IHostConfig } from '@ramp-network/ramp-instant-sdk/dist/types/types'

import { store } from '@/store'
import { useUserStore } from '@/store/user'

const userStore = useUserStore(store)

type RampNetwork = {
  chainId: number
  value: string
}

const mainnetSupportedChains: RampNetwork[] = [
  { chainId: 1666600000, value: 'HARMONY' },
  { chainId: 250, value: 'FANTOM' },
  { chainId: 122, value: 'FUSE' },
  { chainId: 43114, value: 'AVAX' },
  { chainId: 10, value: 'OPTIMISM' },
  { chainId: 42220, value: 'CELO' },
  { chainId: 1, value: 'ETH' },
  { chainId: 30, value: 'RSK' },
  { chainId: 56, value: 'BSC' },
  { chainId: 100, value: 'XDAI' },
  { chainId: 137, value: 'MATIC' },
  { chainId: 324, value: 'ZKSYNC' },
  { chainId: 10000, value: 'BCH' },
  { chainId: 314, value: 'FILECOIN' },
  { chainId: 42161, value: 'ARBITRUM' },
  { chainId: 2000, value: 'DOGE' },
]

const testnetSupportedChains: RampNetwork[] = [
  { chainId: 421613, value: 'ARBITRUM' },
  { chainId: 44787, value: 'CELO' },
  { chainId: 123, value: 'FUSE' },
  { chainId: 280, value: 'ZKSYNC' },
  { chainId: 97, value: 'BSC' },
  { chainId: 1666700000, value: 'HARMONY' },
  { chainId: 80001, value: 'MATIC' },
  { chainId: 5, value: 'GOERLI' },
  { chainId: 11155111, value: 'SEPOLIA' },
  { chainId: 10200, value: 'XDAI' },
  { chainId: 10001, value: 'BCH' },
  { chainId: 69, value: 'OPTIMISM' },
  { chainId: 43113, value: 'AVAX' },
]

async function openRampSdk(network: string) {
  return new Promise((resolve) => {
    const swapAsset = `${network}_*`
    const rampSdkParams: IHostConfig = {
      hostAppName: 'Arcana OnRamp',
      hostLogoUrl:
        'https://uploads-ssl.webflow.com/63aa7f8ce3b3be42ed4f4a3f/63c1115844d4cffb40ebf7d3_favicon-32x32.png',
      hostApiKey: process.env.VUE_APP_RAMP_API_KEY,
      swapAsset,
      enabledFlows: ['ONRAMP'],
      userAddress: userStore.walletAddress,
      userEmailAddress: userStore.info.email || '',
      variant: 'embedded-mobile',
      containerNode: document.getElementById('ramp-container') as HTMLElement,
    }
    if (process.env.VUE_APP_RAMP_ENV === 'STAGING') {
      rampSdkParams.url = 'https://app.demo.ramp.network'
    }
    const rampInstant = new RampInstantSDK(rampSdkParams)
    rampInstant.on('*', (event) => {
      if (event.type === 'WIDGET_CLOSE') {
        return resolve({ closed: true })
      }
      if (event.type === 'WIDGET_CONFIG_FAILED') {
        rampInstant.close()
      }
      // if (event.type === 'PURCHASE_CREATED') {
      //   console.log(event)
      // }
    })
    rampInstant.show()
  })
}

function getRampSupportedNetworks() {
  if (process.env.VUE_APP_RAMP_ENV === 'STAGING') {
    return testnetSupportedChains
  }
  return mainnetSupportedChains
}

export { openRampSdk, getRampSupportedNetworks }
