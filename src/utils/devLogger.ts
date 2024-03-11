import { AUTH_NETWORK } from '@/utils/constants'

export const devLogger = {
  time(val: string) {
    if (AUTH_NETWORK === 'dev') {
      console.time(val)
    }
  },
  timeEnd(val: string) {
    if (AUTH_NETWORK === 'dev') {
      console.timeEnd(val)
    }
  },
  log(...args: any[]) {
    if (AUTH_NETWORK === 'dev') {
      console.log(`[DevLogger env: ${AUTH_NETWORK}] ==>`, ...args)
    }
  },
}
