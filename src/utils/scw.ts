import SCW from '@arcana/scw'

const scwInstance = new SCW()

async function initSCW(appId: string, provider: any) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  await scwInstance.init(appId, provider)
}

export { initSCW, scwInstance }
