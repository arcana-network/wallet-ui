import HomePage from '@src/pages/homePage.vue'
import LoginRedirect from '@src/pages/loginRedirect.vue'
import SignIn from '@src/pages/signIn.vue'
import SignMessage from '@src/pages/signMessage.vue'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/:appId/login',
    component: SignIn,
  },
  {
    path: '/redirect',
    component: LoginRedirect,
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
