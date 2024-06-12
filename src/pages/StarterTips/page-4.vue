<script setup lang="ts">
const dots = [1, 2, 3, 4, 5, 6]
</script>

<template>
  <div class="h-full p-6">
    <div class="space-y-4 h-1/4">
      <h1 class="font-Nohemi text-xl uppercase font-black">
        Digital Collectibles Support
      </h1>
      <p class="text-sm">
        View, send or receive NFTs from all the supported blockchains right
        within the Pop-Up Wallet.
      </p>
      <div class="h-7 m-auto space-x-2 w-full flex justify-center items-center">
        <span
          v-for="dot in dots"
          :key="dot"
          class="block h-[5px] w-[5px] rounded-full"
          :class="dot === 4 ? 'dark:bg-white-100 bg-black-100' : 'bg-[#8D8D8D]'"
        ></span>
      </div>
    </div>
    <div class="h-3/4 startertips">
      <div class="absolute z-[2147483648] w-44 h-44 top-5 left-0">
        <img
          src="@/assets/images/starter-tips/page-4.png"
          alt="wallet-address"
          class="border-1 border-white-400 rounded-full"
        />
      </div>
    </div>
  </div>
</template>
