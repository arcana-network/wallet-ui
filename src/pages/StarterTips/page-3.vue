<script setup lang="ts">
const dots = [1, 2, 3, 4]
</script>

<template>
  <div class="space-y-4 h-full flex flex-col">
    <div class="flex justify-end flex-1">
      <img
        src="@/assets/images/starter-tips/page-3.png"
        alt="wallet-address"
        class="rounded-full w-20 h-20"
      />
    </div>
    <h1 class="text-xl uppercase font-black">Access Multiple Networks</h1>
    <p class="text-sm text-[#8D8D8D]">
      Gain access to a variety of blockchain networks, including popular ones
      such as Ethereum, Arbitrum, Polygon, etc. as well as custom chains created
      by your favorite dApp developers.
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
</template>
