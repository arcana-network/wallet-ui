import { createRouter, createWebHistory } from 'vue-router'

import AddOrEditNFTScreen from '@/pages/AddOrEditNFTScreen.vue'
import AddTokenScreen from '@/pages/AddTokenScreen.vue'
import InitPage from '@/pages/backCompat/initPage.vue'
import LoginRedirect from '@/pages/backCompat/loginRedirect.vue'
import SignIn from '@/pages/backCompat/signIn.vue'
import HomeScreen from '@/pages/homeScreen.vue'
import InitPageV2 from '@/pages/initPageV2.vue'
import LoginRedirectV2 from '@/pages/loginRedirectV2.vue'
import ManageNFTScreen from '@/pages/ManageNFTScreen.vue'
import NFTScreen from '@/pages/NFTScreen.vue'
import ProfileScreen from '@/pages/profileScreen.vue'
import RequestsScreen from '@/pages/RequestsScreen.vue'
import SignInV2 from '@/pages/signInV2.vue'

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
    path: '/:appId/v2/login',
    component: SignInV2,
  },
  {
    path: '/:appId/v2/redirect/',
    component: LoginRedirectV2,
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
    name: 'Nfts',
    path: '/nfts',
    component: NFTScreen,
  },
  {
    name: 'ManageNft',
    path: '/nfts/manage',
    component: ManageNFTScreen,
  },
  {
    name: 'AddNft',
    path: '/nfts/add',
    component: AddOrEditNFTScreen,
  },
  {
    name: 'EditNft',
    path: '/nfts/edit',
    component: AddOrEditNFTScreen,
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
    name: 'AddToken',
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
