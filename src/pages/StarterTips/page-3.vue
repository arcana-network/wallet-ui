<script setup lang="ts">
const dots = [1, 2, 3, 4, 5, 6]
</script>

<template>
  <div class="h-full w-full flex flex-col">
    <div class="h-1/4 w-full relative">
      <div class="h-full w-full relative">
        <div class="absolute z-[2147483648] w-16 h-16 top-12 right-10"></div>
      </div>
    </div>
    <div
      class="text-black-100 dark:text-white-100 bg-gray-900 dark:bg-black-100 flex flex-col h-3/4 px-4"
    >
      <h1 class="font-Nohemi text-[20px] font-medium uppercase">
        Access Multiple Networks
      </h1>
      <p class="text-sm">
        Gain access to a variety of blockchain networks, including popular ones
        such as Ethereum, Arbitrum, Polygon, etc. as well as custom chains
        created by your favorite dApp developers.
      </p>
      <div class="mt-2 space-x-2 w-full flex justify-center items-center">
        <span
          v-for="dot in dots"
          :key="dot"
          class="block h-[5px] w-[5px] rounded-full"
          :class="dot === 3 ? 'dark:bg-white-100 bg-black-100' : 'bg-[#8D8D8D]'"
        ></span>
      </div>
    </div>
  </div>
</template>
