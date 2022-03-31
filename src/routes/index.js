import { createRouter, createWebHistory } from "vue-router";
import SignIn from "@/pages/signIn.vue";
import SignMessage from "@/pages/signMessage.vue";
import LoginRedirect from "@/pages/loginRedirect.vue";
import HomePage from "@/pages/homePage.vue";

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
    path: "/",
    component: HomePage,
  },
  {
    path: "/wallet",
    component: SignMessage,
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
