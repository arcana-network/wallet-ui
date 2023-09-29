import type { InitParams } from '@arcana/auth-core/types/types'

const DOCS_URL = process.env.VUE_APP_ARCANA_DOCS_URL
const HIDE_ON_RAMP = process.env.VUE_APP_HIDE_ON_RAMP
const AUTH_URL = process.env.VUE_APP_WALLET_AUTH_URL
const GATEWAY_URL = process.env.VUE_APP_WALLET_GATEWAY
const AUTH_NETWORK = process.env
  .VUE_APP_ARCANA_AUTH_NETWORK as InitParams['network']
const GAS_FEE_UNIT = 'Gwei'
const GAS_PRICE_SPEED_MAP = {
  slow: { wait: 'safeLowWait', price: 'safeLow' },
  standard: { wait: 'avgWait', price: 'average' },
  fast: { wait: 'fastWait', price: 'fast' },
}
const TOAST_TIME_OUT = 5000
const SESSION_EXPIRY_MS = 30 * 60 * 1000
export {
  SESSION_EXPIRY_MS,
  DOCS_URL,
  HIDE_ON_RAMP,
  AUTH_URL,
  GATEWAY_URL,
  AUTH_NETWORK,
  GAS_FEE_UNIT,
  GAS_PRICE_SPEED_MAP,
  TOAST_TIME_OUT,
}
