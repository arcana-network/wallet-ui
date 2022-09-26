<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { useAppStore } from '@/store/app'
import { useRequestStore } from '@/store/request'
import { useUserStore } from '@/store/user'
import { useImage } from '@/utils/useImage'

const getImage = useImage()
const userStore = useUserStore()
const appStore = useAppStore()
const router = useRouter()
const requestStore = useRequestStore()

const currentRoute = computed(() => {
  return router.currentRoute.value.name?.toString()
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
</script>

<template>
  <footer
    class="relative flex items-center justify-end h-8"
    :class="{ 'justify-between': userStore.isLoggedIn }"
  >
    <div v-if="userStore.isLoggedIn" class="flex space-x-4">
      <router-link to="/requests" class="relative">
        <img
          :src="getAppropriateIcon('home-icon', 'requests')"
          alt="request"
          class="w-6 h-6"
          :class="{
            'bg-black dark:bg-white p-[2px] rounded-md':
              isCurrentRoute('requests'),
          }"
        />
        <span
          v-if="requestStore.areRequestsPendingForApproval"
          class="flex h-[9px] w-[9px] absolute top-[1px] right-[1px]"
        >
          <span
            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-700 opacity-75"
          ></span>
          <span
            class="relative inline-flex rounded-full h-[9px] w-[9px] bg-red-700"
          ></span>
        </span>
      </router-link>
      <router-link to="/">
        <img
          :src="getAppropriateIcon('coins-stacked-icon', 'home')"
          alt="home"
          class="w-6 h-6"
          :class="{
            'bg-black dark:bg-white p-[2px] rounded-md': isCurrentRoute('home'),
          }"
        />
      </router-link>
      <router-link to="/profileScreen">
        <img
          :src="getAppropriateIcon('profile-icon', 'profile')"
          alt="profile"
          class="w-6 h-6"
          :class="{
            'bg-black dark:bg-white p-[2px] rounded-md':
              isCurrentRoute('profile'),
          }"
        />
      </router-link>
    </div>
    <div class="flex items-center justify-center">
      <a href="https://arcana.network/" target="_blank">
        <img class="w-16 h-auto" :src="getImage('powered-by-arcana')" />
      </a>
    </div>
  </footer>
</template>
