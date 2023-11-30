<script setup lang="ts">
const dots = [1, 2, 3, 4]
</script>

<template>
  <div class="h-full w-full flex flex-col">
    <div class="h-3/5 w-full relative">
      <div class="h-full w-full bg-black-100 opacity-90 absolute"></div>
    </div>
    <div class="bg-black-100 opacity-90 h-2/5 p-6">
      <h1 class="text-xl uppercase font-black">Access Multiple Networks</h1>
      <p class="text-sm text-[#8D8D8D]">
        Gain access to a variety of blockchain networks, including popular ones
        such as Ethereum, Arbitrum, Polygon, etc. as well as custom chains
        created by your favorite dApp developers.
      </p>
      <div class="h-7 m-auto space-x-2 w-full flex justify-center items-center">
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
