import { createRouter, createWebHistory } from 'vue-router'

import AddTokenScreen from '@/pages/AddTokenScreen.vue'
import InitPage from '@/pages/backCompat/initPage.vue'
import SignIn from '@/pages/backCompat/signIn.vue'
import HomeScreen from '@/pages/homeScreen.vue'
import InitPageV2 from '@/pages/initPageV2.vue'
import LoginRedirect from '@/pages/loginRedirect.vue'
import ProfileScreen from '@/pages/profileScreen.vue'
import RequestsScreen from '@/pages/RequestsScreen.vue'
import SignInV2 from '@/pages/signInV2.vue'

const routes = [
  // Old pages for backward compatiability
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
  // New pages
  {
    path: '/:appId/v2/login',
    component: SignInV2,
  },
  {
    path: '/:appId/v2/init/',
    component: InitPageV2,
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
