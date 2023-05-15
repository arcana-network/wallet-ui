<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { useAppStore } from '@/store/app'
import { useUserStore } from '@/store/user'
import { getImage } from '@/utils/getImage'
import { useImage } from '@/utils/useImage'

const userStore = useUserStore()
const appStore = useAppStore()
const route = useRoute()
const getImageOld = useImage()

const currentRoute = computed(() => {
  return route.name
})

function isCurrentRoute(pathName) {
  return currentRoute.value === pathName
}

function getAppropriateIcon(iconName, pathName) {
  const isDark = appStore.theme === 'dark'
  if (isCurrentRoute(pathName))
    return getImage(iconName, isDark ? 'light' : 'dark')
  else return getImage(iconName)
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
  <footer class="flex items-center px-12 py-2 dark:bg-black-400">
    <div v-if="userStore.isLoggedIn" class="flex flex-grow justify-between">
      <router-link
        :to="{ name: 'home' }"
        title="Assets"
        class="flex flex-col justify-center items-center gap-1"
      >
        <div
          class="w-xxxl h-xxl rounded-md flex items-center justify-center"
          :class="{ 'bg-white-100': isCurrentRoute('home') }"
        >
          <img
            :src="getIcon('tokens-icon', 'home')"
            alt="home"
            class="w-xl h-xl"
          />
        </div>
        <span
          class="text-xs font-normal text-gray-100"
          :class="{ 'text-white-100': isCurrentRoute('home') }"
          >Tokens</span
        >
      </router-link>
      <router-link
        :to="{ name: 'Nfts' }"
        title="NFTs"
        class="flex flex-col justify-center items-center gap-1"
      >
        <div
          class="w-xxxl h-xxl rounded-md flex items-center justify-center"
          :class="{ 'bg-white-100': isCurrentRoute('Nfts') }"
        >
          <img :src="getIcon('nfts-icon', 'Nfts')" alt="nfts" />
        </div>
        <span
          class="text-xs font-normal text-gray-100"
          :class="{ 'text-white-100': isCurrentRoute('Nfts') }"
          >NFT</span
        >
      </router-link>
      <router-link
        :to="{ name: 'profile' }"
        title="Profile"
        class="flex flex-col justify-center items-center gap-1"
      >
        <div
          class="w-xxxl h-xxl rounded-md flex items-center justify-center"
          :class="{ 'bg-white-100': isCurrentRoute('profile') }"
        >
          <img :src="getIcon('profile-icon', 'profile')" alt="profile" />
        </div>
        <span
          class="text-xs font-normal text-gray-100"
          :class="{ 'text-white-100': isCurrentRoute('profile') }"
          >Profile</span
        >
      </router-link>
      <router-link
        :to="{ name: 'activities' }"
        title="Activities"
        class="flex flex-col justify-center items-center gap-1"
      >
        <div
          class="w-xxxl h-xxl rounded-md flex items-center justify-center"
          :class="{ 'bg-white-100': isCurrentRoute('activities') }"
        >
          <img
            :src="getIcon('notifications-icon', 'activities')"
            alt="activities"
          />
        </div>
        <span
          class="text-xs font-normal text-gray-100"
          :class="{ 'text-white-100': isCurrentRoute('activities') }"
          >Activity</span
        >
      </router-link>
    </div>
  </footer>
</template>
