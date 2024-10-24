import { SCW } from '@arcana/scw'

// eslint-disable-next-line no-restricted-imports
import { AUTH_NETWORK } from './constants'

import { errors } from '@/utils/content'

const scwInstance = new SCW()

async function initSCW(
  arcana_key: string,
  private_key: string,
  rpc_url: string
) {
  try {
    const arcana_full_key =
      AUTH_NETWORK === 'dev'
        ? `xar_dev_${arcana_key}`
        : AUTH_NETWORK === 'testnet'
        ? `xar_test_${arcana_key}`
        : AUTH_NETWORK === 'mainnet'
        ? `xar_live_${arcana_key}`
        : `xar_live_${arcana_key}`
    const params = {
      arcana_key: arcana_full_key,
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
