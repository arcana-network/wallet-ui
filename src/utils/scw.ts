import SCW from '@arcana/scw'

const gatewayUrl = process.env.VUE_APP_WALLET_GATEWAY

const scwInstance = new SCW()

async function initSCW(appId: string, provider: any) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  await scwInstance.init(appId, provider, gatewayUrl)
}

export { initSCW, scwInstance }
