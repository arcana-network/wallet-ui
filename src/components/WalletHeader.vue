<script setup lang="ts">
import { useAppStore } from '@/store/app'
import { getImage } from '@/utils/getImage'

const appStore = useAppStore()

const emits = defineEmits(['click'])
</script>

<template>
  <header class="flex justify-between px-4 py-2">
    <div class="flex items-center gap-2">
      <img
        :src="appStore.appLogo?.horizontal"
        alt="App Logo"
        class="w-xl h-xl"
      />
      <span class="font-bold text-lg">{{ appStore.name }}</span>
    </div>
    <nav class="flex items-center gap-3">
      <button class="w-xl h-xl rounded-full">
        <img :src="`/chain-logos/ethereum-icon.png`" alt="Network Icon" />
      </button>
      <button class="w-xl h-xl">
        <img :src="getImage('qr-code.svg')" alt="Wallet Icon" />
      </button>
    </nav>
    <!-- <button
      class="h-auto"
      :class="[appStore.compactMode ? 'rotate-180' : 'rotate-0']"
      @click="emits('click')"
    >
      <img :src="getImageOld('arrow-icon')" alt="arrow" />
    </button> -->
  </header>
</template>