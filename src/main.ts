import { Buffer } from 'buffer'

import { BrowserTracing } from '@sentry/tracing'
import { init as SentryInit, vueRouterInstrumentation } from '@sentry/vue'
import { createApp } from 'vue'
import VueGtag from 'vue-gtag'
import JsonViewer from 'vue-json-viewer'
import Toast from 'vue-toastification'

import App from '@/App.vue'
import { router } from '@/routes/index'
import { store } from '@/store'

import 'vue-toastification/dist/index.css'

const toastOptions = {
  timeout: 2500,
  closeOnClick: false,
  pauseOnFocusLoss: false,
  pauseOnHover: true,
  draggable: false,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  closeButton: false,
  icon: true,
  rtl: false,
}

window.Buffer = Buffer

const walletApp = createApp(App)

function getSentryConfig() {
  if (process.env.NODE_ENV === 'production') {
    return {
      dsn: process.env.VUE_APP_SENTRY_DSN,
      tracingOrigins: process.env.VUE_APP_SENTRY_TRACING_ORIGINS?.split(','),
    }
  }
  return {
    dsn: undefined,
    tracingOrigins: undefined,
  }
}

SentryInit({
  app: walletApp,
  dsn: getSentryConfig().dsn,
  integrations: [
    new BrowserTracing({
      routingInstrumentation: vueRouterInstrumentation(router),
      tracingOrigins: getSentryConfig().tracingOrigins,
    }),
  ],
  tracesSampleRate: 1.0,
})

walletApp.use(JsonViewer).use(router).use(Toast, toastOptions).use(store)

if (process.env.NODE_ENV === 'production') {
  walletApp.use(VueGtag, {
    config: { id: process.env.VUE_APP_GOOGLE_ANALYTICS_ID },
  })
}

walletApp.mount('#app')
