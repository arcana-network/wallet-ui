import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import Activities from '@/pages/ActivitiesScreen.vue'
import AddOrEditNFTScreen from '@/pages/AddOrEditNFTScreen.vue'
import AddTokenScreen from '@/pages/AddTokenScreen.vue'
import InitPage from '@/pages/backCompat/initPage.vue'
import SignIn from '@/pages/backCompat/signIn.vue'
import HomeScreen from '@/pages/homeScreen.vue'
import InitPageV2 from '@/pages/initPageV2.vue'
import LoggedInView from '@/pages/loggedInView.vue'
import LoginRedirect from '@/pages/loginRedirect.vue'
import ManageNFTScreen from '@/pages/ManageNFTScreen.vue'
import MFARequiredScreen from '@/pages/MFARequiredScreen.vue'
import MFARestoreScreen from '@/pages/MFARestoreScreen.vue'
import MFASetup from '@/pages/MFASetup.vue'
import NftDetailsScreen from '@/pages/NftDetailsScreen.vue'
import NFTScreen from '@/pages/NFTScreen.vue'
import ProfileScreen from '@/pages/profileScreen.vue'
import RequestsScreen from '@/pages/RequestsScreen.vue'
import SelectNftScreen from '@/pages/SelectNftScreen.vue'
import SignInV2 from '@/pages/signInV2.vue'

const routes: RouteRecordRaw[] = [
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
    path: '/:appId/v2/init/',
    component: InitPageV2,
  },
  {
    path: '/:appId/mfa/setup',
    component: MFASetup,
    name: 'MFASetup',
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
        component: MFARequiredScreen,
        name: 'MFARequired',
      },
      {
        path: '/mfa/restore',
        component: MFARestoreScreen,
        name: 'MFARestore',
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
        name: 'SelectNft',
        path: '/nfts/select',
        component: SelectNftScreen,
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
        props: true,
      },
      {
        name: 'NftDetails',
        path: '/nfts/details',
        component: NftDetailsScreen,
        props: true,
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
      {
        name: 'activities',
        path: '/activities',
        component: Activities,
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
