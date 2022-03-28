import { createApp } from "vue";
import JsonViewer from "vue-json-viewer";
import { createPinia } from "pinia";
import App from "@/App.vue";
import { router } from "@/routes/index";

const walletApp = createApp(App);

walletApp.use(JsonViewer).use(router).use(createPinia());

walletApp.mount("#app");
