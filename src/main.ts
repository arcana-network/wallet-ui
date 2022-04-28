import { Buffer } from 'buffer'

import App from '@src/App.vue'
import { router } from '@src/routes/index'
import FloatingVue from 'floating-vue'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import JsonViewer from 'vue-json-viewer'
import Toast from 'vue-toastification'

import 'floating-vue/dist/style.css'
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

walletApp
  .use(JsonViewer)
  .use(router)
  .use(Toast, toastOptions)
  .use(FloatingVue)
  .use(createPinia())

walletApp.mount('#app')
