import { createRouter, createWebHistory } from "vue-router";
import SignIn from "../pages/signIn.vue";
import SignMessage from "../pages/signMessage.vue";
import LoginRedirect from "../pages/loginRedirect.vue";

const routes = [
  {
    path: "/:appId/login",
    component: SignIn,
  },
  {
    path: "/redirect",
    component: LoginRedirect,
  },
  {
    path: "/:appId/wallet",
    component: SignMessage,
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
