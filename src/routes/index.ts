import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import HomeScreen from '@/pages/homeScreen.vue'
import InitPageV2 from '@/pages/initPageV2.vue'
import LoggedInView from '@/pages/loggedInView.vue'
import LoginRedirect from '@/pages/loginRedirect.vue'
import ReconnectV1 from '@/pages/ReconnectV1.vue'
import RequestsScreen from '@/pages/RequestsScreen.vue'
import SignInV2 from '@/pages/signInV2.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/:appId/startLogin',
    component: () => import('@/pages/startLogin.vue'),
  },
  {
    path: '/:appId/login',
    component: () => import('@/pages/backCompat/signIn.vue'),
  },
  {
    path: '/global-redirect/',
    component: () => import('@/pages/globalRedirect.vue'),
  },
  {
    path: '/:appId/redirect/',
    component: LoginRedirect,
  },
  {
    path: '/:appId/init/',
    component: () => import('@/pages/backCompat/initPage.vue'),
  },
  {
    path: '/:appId/v2/login',
    component: SignInV2,
  },
  {
    path: '/:appId/v2/init/',
    component: InitPageV2,
  },
  {
    path: '/:appId/v1/reconnect/',
    component: ReconnectV1,
  },
  {
    path: '/:appId/mfa/setup',
    component: () => import('@/pages/MFASetup.vue'),
    name: 'MFASetup',
    meta: {
      isFullPageView: true,
    },
  },
  {
    path: '/:appId/mfa/restore',
    component: () => import('@/pages/MFARestoreScreen.vue'),
    name: 'MFARestore',
    meta: {
      isFullPageView: true,
    },
  },
  {
    name: 'PermissionRequest',
    path: '/:appId/permission',
    component: () => import('@/pages/PermissionRequest.vue'),
  },
  {
    name: 'TransakSell',
    path: '/:appId/sell/transak',
    component: () => import('@/pages/TransakSell.vue'),
    meta: {
      isFullPageView: true,
    },
  },
  {
    path: '/loggedin',
    component: LoggedInView,
    children: [
      {
        path: '/mfa/required',
        component: () => import('@/pages/MFARequiredScreen.vue'),
        name: 'MFARequired',
      },
      {
        name: 'home',
        path: '/',
        component: HomeScreen,
      },
      {
        name: 'StarterTips',
        path: '/starterTips',
        component: () => import('@/pages/StarterTips/index-page.vue'),
      },
      {
        name: 'Nfts',
        path: '/nfts',
        component: () => import('@/pages/NFTScreen.vue'),
      },
      {
        name: 'SelectNft',
        path: '/nfts/select',
        component: () => import('@/pages/SelectNftScreen.vue'),
      },
      {
        name: 'ManageNft',
        path: '/nfts/manage',
        component: () => import('@/pages/ManageNFTScreen.vue'),
      },
      {
        name: 'AddNft',
        path: '/nfts/add',
        component: () => import('@/pages/AddOrEditNFTScreen.vue'),
      },
      {
        name: 'EditNft',
        path: '/nfts/edit',
        component: () => import('@/pages/AddOrEditNFTScreen.vue'),
        props: true,
      },
      {
        name: 'NftDetails',
        path: '/nfts/details',
        component: () => import('@/pages/NftDetailsScreen.vue'),
      },
      {
        name: 'requests',
        path: '/requests',
        component: RequestsScreen,
      },
      {
        name: 'profile',
        path: '/profileScreen',
        component: () => import('@/pages/profileScreen.vue'),
      },
      {
        name: 'AddToken',
        path: '/addToken',
        component: () => import('@/pages/AddTokenScreen.vue'),
      },
      {
        name: 'activities',
        path: '/activities',
        component: () => import('@/pages/ActivitiesScreen.vue'),
      },
      {
        name: 'SendTokens',
        path: '/tokens/send',
        component: () => import('@/pages/SendTokens.vue'),
      },
      {
        name: 'SendNfts',
        path: '/nfts/send',
        component: () => import('@/pages/SendNft.vue'),
        props: true,
      },
    ],
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
