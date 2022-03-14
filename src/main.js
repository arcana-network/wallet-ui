import { createApp } from "vue";
import JsonViewer from "vue-json-viewer";
import App from "./App.vue";

const walletapp = createApp(App);

walletapp.use(JsonViewer);

walletapp.mount("#app");
