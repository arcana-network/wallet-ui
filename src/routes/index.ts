import { createRouter, createWebHistory } from 'vue-router'

import HomePage from '@/pages/homePage.vue'
import InitPage from '@/pages/initPage.vue'
import LoginRedirect from '@/pages/loginRedirect.vue'
import SignIn from '@/pages/signIn.vue'
import SignMessage from '@/pages/signMessage.vue'

const routes = [
  {
    path: '/:appId/login',
    component: SignIn,
  },
  {
    path: '/:appId/redirect/',
    component: LoginRedirect,
  },
  {
    path: '/:appId/init/',
    component: InitPage,
  },
  {
    path: '/',
    component: HomePage,
  },
  {
    name: 'signMessage',
    path: '/signMessage',
    component: SignMessage,
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
