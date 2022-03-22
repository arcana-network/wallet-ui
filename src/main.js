import { createApp } from "vue";
import JsonViewer from "vue-json-viewer";
import App from "./App.vue";
import { router } from "./routes/index";

const walletapp = createApp(App);

walletapp.use(JsonViewer).use(router);

walletapp.mount("#app");
