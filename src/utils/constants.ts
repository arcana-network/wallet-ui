import type { InitParams } from '@arcana/auth-core/types/types'

const DOCS_URL = process.env.VUE_APP_ARCANA_DOCS_URL
const HIDE_ON_RAMP = process.env.VUE_APP_HIDE_ON_RAMP
const AUTH_URL = process.env.VUE_APP_WALLET_AUTH_URL
const GATEWAY_URL = process.env.VUE_APP_WALLET_GATEWAY
const AUTH_NETWORK = process.env
  .VUE_APP_ARCANA_AUTH_NETWORK as InitParams['network']

export { DOCS_URL, HIDE_ON_RAMP, AUTH_URL, GATEWAY_URL, AUTH_NETWORK }
