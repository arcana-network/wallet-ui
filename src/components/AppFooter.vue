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
  return router.currentRoute.value.name
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
    class="flex items-center justify-end py-4"
    :class="{ 'justify-between': userStore.isLoggedIn }"
  >
    <div v-if="userStore.isLoggedIn" class="flex space-x-4">
      <router-link to="/">
        <img
          :src="getAppropriateIcon('coins-stacked-icon', 'home')"
          alt="home"
          class="p-1 rounded-[10px]"
          :class="{
            'bg-black dark:bg-white': isCurrentRoute('home'),
          }"
        />
      </router-link>
      <router-link to="/profileScreen">
        <img
          :src="getAppropriateIcon('profile-icon', 'profile')"
          alt="profile"
          class="p-1 rounded-[10px]"
          :class="{
            'bg-black dark:bg-white': isCurrentRoute('profile'),
          }"
        />
      </router-link>

      <router-link to="/activities">
        <img
          :src="getAppropriateIcon('thunder-icon', 'activities')"
          alt="activities"
          class="p-1 rounded-[10px]"
          :class="{
            'bg-black dark:bg-white': isCurrentRoute('activities'),
          }"
        />
      </router-link>
    </div>
    <div class="flex items-center justify-center">
      <a href="https://arcana.network/" target="_blank">
        <img
          class="h-auto"
          :src="getImage('powered-by-arcana', appStore.theme, 'svg')"
        />
      </a>
    </div>
  </footer>
</template>

<style scoped>
footer {
  padding: var(--p-500);
  background: var(--container-bg-color);
}
</style>
