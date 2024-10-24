import { SCW } from '@arcana/scw'

import { errors } from '@/utils/content'

const arcana_key = process.env.VUE_APP_ARCANA_KEY

const scwInstance = new SCW()

async function initSCW(private_key: string, rpc_url: string) {
  try {
    const params = {
      arcana_key,
      private_key,
      rpc_url,
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await scwInstance.init(params)
  } catch (error) {
    throw new Error(`${errors.SCW.INIT}: ${error}`)
  }
}

export { initSCW, scwInstance }
