<script setup lang="ts">
import { ref, Transition, watch } from 'vue'
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

function skip() {
  storage.local.setHasStarterTipShown(userStore.info.id, true)
  emits('close')
}

watch(
  () => currentPage.value,
  (val) => {
    starterTipsStore.setActivePageNumber(val)
    if (val === 4) {
      router.push({ name: 'Nfts' })
    } else if (val === 5) {
      router.push({ name: 'profile' })
    } else if (val === 6) {
      router.push({ name: 'home' })
    }
  }
)
</script>

<template>
  <div class="flex flex-col w-full rounded-md absolute top-0 left-0 h-full">
    <div class="flex-1">
      <component :is="PagesIndex[currentPage]" />
    </div>
    <div class="flex justify-between bg-black-100 p-6">
      <button class="text-xs" @click="skip">Skip</button>
      <button class="flex items-center space-x-2 text-xs" @click="next">
        <span>Next</span>
        <img src="@/assets/images/arrow-right.svg" alt="next" class="h-3 w-3" />
      </button>
    </div>
    <div
      v-if="currentPage > 1"
      class="h-16 flex justify-around items-center bg-black-100"
    >
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
