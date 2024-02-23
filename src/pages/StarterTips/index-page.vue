<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import NFTIcon from '@/assets/images/starter-tips/nft-icon.png'
import ProfileIcon from '@/assets/images/starter-tips/profile-icon.png'
import TokensIcon from '@/assets/images/starter-tips/tokens-icon.png'
import Page1 from '@/pages/StarterTips/page-1.vue'
import Page2 from '@/pages/StarterTips/page-2.vue'
import Page3 from '@/pages/StarterTips/page-3.vue'
import Page4 from '@/pages/StarterTips/page-4.vue'
import Page5 from '@/pages/StarterTips/page-5.vue'
import Page6 from '@/pages/StarterTips/page-6.vue'
import { useStarterTipsStore } from '@/store/starterTips'
import { useUserStore } from '@/store/user'
import { getStorage } from '@/utils/storageWrapper'

const storage = getStorage()
const currentPage = ref(1)
const userStore = useUserStore()
const router = useRouter()
const starterTipsStore = useStarterTipsStore()
const emits = defineEmits(['close'])

const PagesIndex = {
  1: Page1,
  2: Page2,
  3: Page3,
  4: Page4,
  5: Page5,
  6: Page6,
}

function next() {
  if (currentPage.value === 6) {
    storage.local.setHasStarterTipShown(userStore.info.id, true)
    emits('close')
  } else currentPage.value += 1
}

function previous() {
  if (currentPage.value !== 1) {
    currentPage.value -= 1
  }
}

function skip() {
  emits('close')
}

watch(
  () => currentPage.value,
  (val) => {
    starterTipsStore.setActivePageNumber(val)
    if (val === 2 || val === 3 || val === 6) {
      router.push({ name: 'home' })
    } else if (val === 4) {
      router.push({ name: 'Nfts' })
    } else if (val === 5) {
      router.push({ name: 'profile' })
    }
  }
)
</script>

<template>
  <div class="flex flex-col w-full rounded-md absolute top-0 left-0 h-full">
    <div
      class="flex-1 dark:bg-black-100 bg-gray-900 bg-opacity-90 dark:bg-opacity-80 py-3"
    >
      <div class="px-6 flex justify-end">
        <button class="flex items-center space-x-2 text-xs" @click="skip">
          Skip
        </button>
      </div>
      <component :is="PagesIndex[currentPage]" />
    </div>
    <div
      class="flex dark:bg-black-100 bg-gray-900 p-6"
      :class="[currentPage === 1 ? 'justify-end' : 'justify-between']"
    >
      <button
        v-if="currentPage !== 1"
        class="flex items-center space-x-2 text-xs"
        @click="previous"
      >
        <img
          src="@/assets/images/arrow-right.svg"
          alt="previous"
          class="h-3 w-3 dark:invert-0 invert rotate-180"
        />
        <span>Previous</span>
      </button>
      <button class="flex items-center space-x-2 text-xs" @click="next">
        <span>Next</span>
        <img
          src="@/assets/images/arrow-right.svg"
          alt="next"
          class="h-3 w-3 dark:invert-0 invert"
        />
      </button>
    </div>
    <div
      v-if="currentPage > 1"
      class="h-16 flex justify-around items-center dark:bg-black-100 bg-gray-900"
    >
      <img
        :src="TokensIcon"
        alt="token"
        class="h-12 w-8 dark:invert-0 invert"
        :class="
          currentPage === 2 || currentPage === 3 || currentPage === 6
            ? 'opacity-100'
            : 'opacity-0'
        "
      />
      <img
        :src="NFTIcon"
        alt="nft"
        class="h-12 w-8 dark:invert-0 invert"
        :class="currentPage === 4 ? 'opacity-100' : 'opacity-0'"
      />
      <img
        :src="ProfileIcon"
        alt="profile"
        class="h-12 w-8 dark:invert-0 invert"
        :class="currentPage === 5 ? 'opacity-100' : 'opacity-0'"
      />
      <img :src="ProfileIcon" alt="profile" class="h-12 w-8 opacity-0" />
    </div>
  </div>
</template>
