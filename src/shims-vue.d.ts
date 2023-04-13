/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare namespace NodeJS {
  interface ProcessEnv {
    VUE_APP_WALLET_AUTH_URL: string
    VUE_APP_GOOGLE_ANALYTICS_ID: string
    VUE_APP_ENABLE_PENPAL_DEBUG: 'true' | 'false'
    VUE_APP_ARCANA_AUTH_NETWORK: 'testnet' | 'dev'
    VUE_APP_WALLET_GATEWAY: string
    VUE_APP_SENTRY_DSN: string
    VUE_APP_SENTRY_TRACING_ORIGINS: string
    VUE_APP_WALLET_RPC_URL: string
    VUE_APP_CONTRACT_EVENT_CODE: string
    VUE_APP_WALLET_DOMAIN: string
    VUE_APP_ARCANA_DOCS_URL: string
    VUE_APP_OAUTH_SERVER_URL: string
    VUE_APP_TRANSAK_ENV: 'STAGING' | 'PRODUCTION'
    VUE_APP_TRANSAK_API_KEY: string
    VUE_APP_RAMP_API_KEY: string
    VUE_APP_RAMP_ENV: 'STAGING' | 'PRODUCTION'
    VUE_APP_HIDE_ON_RAMP: 'true' | undefined
    VUE_APP_ANKR_PREMIUM_API_URL: string
  }
}

declare module 'vue-json-viewer'
