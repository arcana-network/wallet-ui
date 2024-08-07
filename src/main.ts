import { Buffer } from 'buffer'

import { BrowserTracing } from '@sentry/tracing'
import { init as SentryInit, vueRouterInstrumentation } from '@sentry/vue'
import { GesturePlugin } from '@vueuse/gesture'
import { MotionPlugin } from '@vueuse/motion'
import { createApp } from 'vue'
import VueGtag from 'vue-gtag'
import JsonViewer from 'vue-json-viewer'
import Toast from 'vue-toastification'

import App from '@/App.vue'
import { router } from '@/routes'
import { store } from '@/store'
import { TOAST_TIME_OUT } from '@/utils/constants'

import '@fontsource/montserrat/variable.css'
import '@fontsource/sora/variable.css'
import 'vue-toastification/dist/index.css'

const toastOptions = {
  timeout: TOAST_TIME_OUT,
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

if (
  process.env.VUE_APP_ENABLE_SENTRY === 'true' &&
  process.env.NODE_ENV === 'production'
) {
  SentryInit({
    app: walletApp,
    dsn: process.env.VUE_APP_SENTRY_DSN,
    integrations: [
      new BrowserTracing({
        routingInstrumentation: vueRouterInstrumentation(router),
        tracingOrigins: process.env.VUE_APP_SENTRY_TRACING_ORIGINS?.split(','),
      }),
    ],
    tracesSampleRate: 1.0,
    logErrors: false,
  })
}

walletApp
  .use(JsonViewer)
  .use(router)
  .use(Toast, toastOptions)
  .use(store)
  .use(MotionPlugin)
  .use(GesturePlugin)

if (process.env.NODE_ENV === 'production') {
  walletApp.use(VueGtag, {
    config: { id: process.env.VUE_APP_GOOGLE_ANALYTICS_ID },
  })
}

walletApp.mount('#app')
