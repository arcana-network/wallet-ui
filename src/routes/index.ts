import { createRouter, createWebHistory } from 'vue-router'

import AddTokenScreen from '@/pages/AddTokenScreen.vue'
import HomeScreen from '@/pages/homeScreen.vue'
import InitPage from '@/pages/initPage.vue'
import LoginRedirect from '@/pages/loginRedirect.vue'
import ProfileScreen from '@/pages/profileScreen.vue'
import RequestsScreen from '@/pages/RequestsScreen.vue'
import SignIn from '@/pages/signIn.vue'

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
    name: 'home',
    path: '/',
    component: HomeScreen,
  },
  {
    name: 'requests',
    path: '/requests',
    component: RequestsScreen,
  },
  {
    name: 'profile',
    path: '/profileScreen',
    component: ProfileScreen,
  },
  {
    name: 'addToken',
    path: '/addToken',
    component: AddTokenScreen,
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return {
      top: 0,
    }
  },
})
