<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { useAppStore } from '@/store/app'
import { useRequestStore } from '@/store/request'
import { useUserStore } from '@/store/user'
import { ChainType } from '@/utils/chainType'
import { getImage } from '@/utils/getImage'
import { useSVGInjector } from '@/utils/useSvgInjector.ts'
import { getFontFaimly, getFontSizeStyle } from '@/utils/utilsFunction'

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

const tokenContainer = ref<HTMLElement | null>(null)
const nftContainer = ref<HTMLElement | null>(null)
const profileContainer = ref<HTMLElement | null>(null)
const activityContainerN = ref<HTMLElement | null>(null)
const activityContainerNotN = ref<HTMLElement | null>(null)

const svgRefs = [
  tokenContainer,
  nftContainer,
  profileContainer,
  activityContainerN,
  activityContainerNotN,
]

const { fetchAndInjectSVG } = useSVGInjector(svgRefs, false, true)
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
          <div ref="tokenContainer">
            <img
              :src="getIcon('tokens-icon', 'home')"
              alt="home"
              class="w-xl h-xl"
              @load="(event) => fetchAndInjectSVG(event, 0)"
            />
          </div>
        </div>
        <span
          :style="{
            fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
              .primaryFontClass,
            color: appStore.theme_settings.accent_color,
          }"
          :class="
            isCurrentRoute('home')
              ? getFontSizeStyle(Number(appStore.theme_settings.font_size))
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
          <div ref="nftContainer">
            <img
              :src="getIcon('nfts-icon', 'Nfts')"
              alt="nfts"
              @load="(event) => fetchAndInjectSVG(event, 1)"
            />
          </div>
        </div>
        <span
          :style="{
            fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
              .primaryFontClass,
            color: appStore.theme_settings.accent_color,
          }"
          :class="
            isCurrentRoute('Nfts')
              ? getFontSizeStyle(Number(appStore.theme_settings.font_size))
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
          <div ref="profileContainer">
            <img
              :src="getIcon('profile-icon', 'profile')"
              alt="profile"
              @load="(event) => fetchAndInjectSVG(event, 2)"
            />
          </div>
        </div>
        <span
          :style="{
            fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
              .primaryFontClass,
            color: appStore.theme_settings.accent_color,
          }"
          :class="
            isCurrentRoute('profile')
              ? getFontSizeStyle(Number(appStore.theme_settings.font_size))
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
          <div
            v-if="requestStore.skippedRequestsForApproval.length > 0"
            ref="activityContainerN"
          >
            <img
              :src="getIcon('notifications-icon', 'activities')"
              alt="activities"
              @load="(event) => fetchAndInjectSVG(event, 3)"
            />
          </div>
          <div v-else ref="activityContainerNotN">
            <img
              :src="getIcon('no-notifications-icon', 'activities')"
              alt="activities"
              @load="(event) => fetchAndInjectSVG(event, 4)"
            />
          </div>
        </div>
        <span
          :style="{
            fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
              .primaryFontClass,
            color: appStore.theme_settings.accent_color,
          }"
          :class="
            isCurrentRoute('activities')
              ? getFontSizeStyle(Number(appStore.theme_settings.font_size))
              : 'text-gray-bermuda-grey dark:text-gray-spanish'
          "
          >Activity</span
        >
      </router-link>
    </nav>
  </footer>
</template>
