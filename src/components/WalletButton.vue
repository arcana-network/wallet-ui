<script setup lang="ts">
import { toRefs } from 'vue'

import { useAppStore } from '@/store/app'
import { useImage } from '@/utils/useImage'

const appStore = useAppStore()
const getImage = useImage()
const { walletPosition } = toRefs(appStore)

function onClickOfButton() {
  appStore.showWallet = true
}
</script>

<template>
  <button
    class="container | w-14 h-11 flex justify-center items-center cursor-pointer"
    :class="[
      walletPosition === 'right' ? 'rounded-l-[10px]' : 'rounded-r-[10px]',
    ]"
    @click="onClickOfButton"
  >
    <img
      :src="getImage('arrow-icon')"
      alt="arrow icon"
      :class="[walletPosition === 'right' ? 'rotate-90' : 'rotate-[270deg]']"
    />
  </button>
</template>

<style scoped>
.container {
  background: var(--container-bg-color);
}
</style>
