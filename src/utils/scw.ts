import SCW from '@arcana/scw'

import { errors } from '@/utils/content'

const gatewayUrl = process.env.VUE_APP_WALLET_GATEWAY

const scwInstance = new SCW()

async function initSCW(appId: string, provider: any) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  try {
    await scwInstance.init(appId, provider, gatewayUrl)
  } catch (error) {
    throw new Error(`${errors.SCW.INIT}: ${error}`)
  }
}

export { initSCW, scwInstance }
