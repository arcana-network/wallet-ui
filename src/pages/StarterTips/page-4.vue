<script setup lang="ts">
const dots = [1, 2, 3, 4]
</script>

<template>
  <div class="space-y-4 h-full p-6 bg-black-100 opacity-90">
    <h1 class="text-xl uppercase font-black">Digital Collectibles Support</h1>
    <p class="text-sm text-[#8D8D8D]">
      View, send or receive NFTs from all the supported blockchains right within
      the Pop-Up Wallet.
    </p>
    <div class="h-7 m-auto space-x-2 w-full flex justify-center items-center">
      <span
        v-for="dot in dots"
        :key="dot"
        class="block h-[5px] w-[5px] rounded-full"
        :class="dot === 2 ? 'bg-[#FFFFFF]' : 'bg-[#8D8D8D]'"
      ></span>
    </div>
  </div>
</template>
