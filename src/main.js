import { createApp } from "vue";
import JsonViewer from "vue-json-viewer";
import { createPinia } from "pinia";
import App from "@/App.vue";
import { router } from "@/routes/index";
import { Buffer } from "buffer";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

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
};

window.Buffer = Buffer;

const walletApp = createApp(App);

walletApp
  .use(JsonViewer)
  .use(router)
  .use(Toast, toastOptions)
  .use(createPinia());

walletApp.mount("#app");
