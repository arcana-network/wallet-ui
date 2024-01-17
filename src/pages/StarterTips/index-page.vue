<script setup lang="ts">
import { ref, Transition } from 'vue'
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
import { useUserStore } from '@/store/user'
import { getStorage } from '@/utils/storageWrapper'

const storage = getStorage()
const currentPage = ref(1)
const userStore = useUserStore()
const router = useRouter()

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
    router.push({ name: 'home' })
  } else currentPage.value += 1
}

function skip() {
  storage.local.setHasStarterTipShown(userStore.info.id, true)
  router.push({ name: 'home' })
}
</script>

<template>
  <div
    class="space-y-4 flex flex-col p-6 rounded-md absolute top-0 left-0 bg-black-100 h-full"
  >
    <div class="flex-1 space-y-4">
      <Transition appear name="fade" mode="out-in">
        <component :is="PagesIndex[currentPage]" />
      </Transition>
    </div>
    <div class="flex justify-between">
      <button class="text-xs" @click="skip">Skip</button>
      <button class="flex items-center space-x-2 text-xs" @click="next">
        <span>Next</span>
        <img src="@/assets/images/arrow-right.svg" alt="next" class="h-3 w-3" />
      </button>
    </div>
    <div v-if="currentPage > 1" class="h-16 flex justify-around items-center">
      <img
        :src="TokensIcon"
        alt="token"
        class="h-12 w-8"
        :class="
          currentPage === 2 || currentPage === 3 || currentPage === 6
            ? 'opacity-100'
            : 'opacity-0'
        "
      />
      <img
        :src="NFTIcon"
        alt="nft"
        class="h-12 w-8"
        :class="currentPage === 4 ? 'opacity-100' : 'opacity-0'"
      />
      <img
        :src="ProfileIcon"
        alt="profile"
        class="h-12 w-8"
        :class="currentPage === 5 ? 'opacity-100' : 'opacity-0'"
      />
      <img :src="ProfileIcon" alt="profile" class="h-12 w-8 opacity-0" />
    </div>
  </div>
</template>
