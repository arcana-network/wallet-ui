<script setup lang="ts">
const dots = [1, 2, 3, 4]
</script>

<template>
  <div class="h-full w-full flex flex-col">
    <div class="h-1/4 w-full relative bg-black-100 bg-opacity-80">
      <div class="h-full w-full relative">
        <div class="absolute z-[2147483648] w-16 h-16 top-12 right-10"></div>
      </div>
    </div>
    <div class="bg-black-100 flex flex-col h-3/4 px-4">
      <h1 class="text-xl uppercase font-black">Access Multiple Networks</h1>
      <p class="text-sm text-[#8D8D8D]">
        Gain access to a variety of blockchain networks, including popular ones
        such as Ethereum, Arbitrum, Polygon, etc. as well as custom chains
        created by your favorite dApp developers.
      </p>
      <div class="mt-2 space-x-2 w-full flex justify-center items-center">
        <span
          v-for="dot in dots"
          :key="dot"
          class="block h-[5px] w-[5px] rounded-full"
          :class="dot === 1 ? 'bg-[#FFFFFF]' : 'bg-[#8D8D8D]'"
        ></span>
      </div>
    </div>
  </div>
</template>
