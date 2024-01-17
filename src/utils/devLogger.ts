import { AUTH_NETWORK } from '@/utils/constants'

export const devLogger = {
  log(...args: any[]) {
    if (AUTH_NETWORK === 'dev') {
      console.log(`[DevLogger env: ${AUTH_NETWORK}] ==>`, ...args)
    }
  },
}
