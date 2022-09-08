import { createRouter, createWebHistory } from 'vue-router'

import HomePage from '@/pages/homePage.vue'
import InitPage from '@/pages/initPage.vue'
import LoginRedirect from '@/pages/loginRedirect.vue'
import ProfileScreen from '@/pages/profileScreen.vue'
import RequestsScreen from '@/pages/RequestsScreen.vue'
import SendTransaction from '@/pages/sendTransaction.vue'
import SignIn from '@/pages/signIn.vue'
// import SignMessage from '@/pages/signMessage.vue'

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
    name: 'requests',
    path: '/requests',
    component: RequestsScreen,
  },
  {
    name: 'profileScreen',
    path: '/profileScreen',
    component: ProfileScreen,
  },
  {
    name: 'sendTransaction',
    path: '/sendTransaction',
    component: SendTransaction,
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
