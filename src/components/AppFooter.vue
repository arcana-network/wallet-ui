<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { useAppStore } from '@/store/app'
import { useRequestStore } from '@/store/request'
import { useUserStore } from '@/store/user'
import { ChainType } from '@/utils/chainType'
import { getImage } from '@/utils/getImage'

const appStore = useAppStore()
const userStore = useUserStore()
const route = useRoute()
const requestStore = useRequestStore()

const currentRoute = computed(() => {
  return route.name
})

function isCurrentRoute(pathName) {
  return currentRoute.value === pathName
}

function getIcon(icon: string, pathName: string) {
  if (isCurrentRoute(pathName)) {
    return getImage(`${icon}-selected.svg`)
  } else {
    return getImage(`${icon}.svg`)
  }
}
</script>

<template>
  <footer
    class="flex items-center px-12 py-2 bg-gray-900 border-gray-800 dark:bg-black-eerie select-none"
  >
    <nav v-if="userStore.isLoggedIn" class="flex flex-grow justify-between">
      <router-link
        :to="{ name: 'home' }"
        title="Assets"
        class="flex flex-col justify-center items-center gap-1"
      >
        <div class="w-xxxl h-xxl rounded-md flex items-center justify-center">
          <img
            :src="getIcon('tokens-icon', 'home')"
            alt="home"
            class="w-xl h-xl"
          />
        </div>
        <span
          class="text-xs font-normal"
          :class="
            isCurrentRoute('home')
              ? 'text-blue-dark dark:text-white-200'
              : 'text-gray-bermuda-grey dark:text-gray-spanish'
          "
          >Tokens</span
        >
      </router-link>
      <router-link
        v-if="appStore.chainType !== ChainType.near_cv25519"
        :to="{ name: 'Nfts' }"
        title="NFTs"
        class="flex flex-col justify-center items-center gap-1"
      >
        <div class="w-xxxl h-xxl rounded-md flex items-center justify-center">
          <img :src="getIcon('nfts-icon', 'Nfts')" alt="nfts" />
        </div>
        <span
          class="text-xs font-normal"
          :class="
            isCurrentRoute('Nfts')
              ? 'text-blue-dark dark:text-white-200'
              : 'text-gray-bermuda-grey dark:text-gray-spanish'
          "
          >NFT</span
        >
      </router-link>
      <router-link
        :to="{ name: 'profile' }"
        title="Profile"
        class="flex flex-col justify-center items-center gap-1"
      >
        <div class="w-xxxl h-xxl rounded-md flex items-center justify-center">
          <img :src="getIcon('profile-icon', 'profile')" alt="profile" />
        </div>
        <span
          class="text-xs font-normal"
          :class="
            isCurrentRoute('profile')
              ? 'text-blue-dark dark:text-white-200'
              : 'text-gray-bermuda-grey dark:text-gray-spanish'
          "
          >Profile</span
        >
      </router-link>
      <router-link
        :to="{ name: 'activities' }"
        title="Activities"
        class="flex flex-col justify-center items-center gap-1"
      >
        <div class="w-xxxl h-xxl rounded-md flex items-center justify-center">
          <img
            v-if="requestStore.skippedRequestsForApproval.length > 0"
            :src="getIcon('notifications-icon', 'activities')"
            alt="activities"
          />
          <img
            v-else
            :src="getIcon('no-notifications-icon', 'activities')"
            alt="activities"
          />
        </div>
        <span
          class="text-xs font-normal"
          :class="
            isCurrentRoute('activities')
              ? 'text-blue-dark dark:text-white-200'
              : 'text-gray-bermuda-grey dark:text-gray-spanish'
          "
          >Activity</span
        >
      </router-link>
    </nav>
  </footer>
</template>
