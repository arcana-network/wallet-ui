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
    class="accent-color flex items-center px-12 py-2 bg-gray-900 border-gray-800 dark:bg-black-eerie select-none"
  >
    <nav v-if="userStore.isLoggedIn" class="flex flex-grow justify-between">
      <router-link
        :to="{ name: 'home' }"
        title="Assets"
        class="flex flex-col justify-center items-center gap-1"
      >
        <div
          v-if="isCurrentRoute('home')"
          class="accent-color w-xxxl h-xxl rounded-md flex items-center justify-center"
        >
          <img
            :src="getImage('tokens-icon-selected.svg')"
            alt="home"
            class="w-xl h-xl"
            onload="SVGInject(this)"
          />
        </div>
        <div
          v-else
          class="accent-color w-xxxl h-xxl rounded-md flex items-center justify-center"
        >
          <img
            :src="getImage('tokens-icon.svg')"
            alt="home"
            class="w-xl h-xl"
            onload="SVGInject(this)"
          />
        </div>
        <span
          class="text-xs accent-color font-normal"
          :class="
            isCurrentRoute('home')
              ? 'text-blue-dark dark:text-white-200 accent-color'
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
        <div
          v-if="isCurrentRoute('Nfts')"
          class="accent-color w-xxxl h-xxl rounded-md flex items-center justify-center"
        >
          <img
            :src="getImage('nfts-icon-selected.svg')"
            alt="nfts"
            onload="SVGInject(this)"
          />
        </div>
        <div
          v-else
          class="accent-color w-xxxl h-xxl rounded-md flex items-center justify-center"
        >
          <img
            :src="getImage('nfts-icon.svg')"
            alt="nfts"
            onload="SVGInject(this)"
          />
        </div>
        <span
          class="text-xs accent-color font-normal"
          :class="
            isCurrentRoute('Nfts')
              ? 'text-blue-dark dark:text-white-200 accent-color'
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
        <div
          v-if="isCurrentRoute('profile')"
          class="accent-color w-xxxl h-xxl rounded-md flex items-center justify-center"
        >
          <img
            :src="getImage('profile-icon-selected.svg')"
            alt="profile"
            onload="SVGInject(this)"
          />
        </div>
        <div
          v-else
          class="accent-color w-xxxl h-xxl rounded-md flex items-center justify-center"
        >
          <img
            :src="getImage('profile-icon.svg')"
            alt="profile"
            onload="SVGInject(this)"
          />
        </div>
        <span
          class="text-xs accent-color font-normal"
          :class="
            isCurrentRoute('profile')
              ? 'text-blue-dark dark:text-white-200 accent-color'
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
          <div v-if="requestStore.skippedRequestsForApproval.length === 0">
            <div
              v-if="isCurrentRoute('activities')"
              class="accent-color w-xxxl h-xxl rounded-md flex items-center justify-center"
            >
              <img
                :src="getImage('notifications-icon-selected.svg')"
                alt="notifications"
                onload="SVGInject(this)"
              />
            </div>
            <div
              v-else
              class="accent-color w-xxxl h-xxl rounded-md flex items-center justify-center"
            >
              <img
                :src="getImage('notifications-icon.svg')"
                alt="notifications"
                onload="SVGInject(this)"
              />
            </div>
          </div>
          <div v-else>
            <div
              v-if="isCurrentRoute('activities')"
              class="accent-color w-xxxl h-xxl rounded-md flex items-center justify-center"
            >
              <img
                :src="getImage('no-notifications-icon-selected.svg')"
                alt="activities"
                onload="SVGInject(this)"
              />
            </div>
            <div
              v-else
              class="accent-color w-xxxl h-xxl rounded-md flex items-center justify-center"
            >
              <img
                :src="getImage('no-notifications-icon.svg')"
                alt="activities"
                onload="SVGInject(this)"
              />
            </div>
          </div>
        </div>
        <span
          class="text-xs accent-color font-normal"
          :class="
            isCurrentRoute('activities')
              ? 'text-blue-dark dark:text-white-200 accent-color'
              : 'text-gray-bermuda-grey dark:text-gray-spanish'
          "
          >Activity</span
        >
      </router-link>
    </nav>
  </footer>
</template>
