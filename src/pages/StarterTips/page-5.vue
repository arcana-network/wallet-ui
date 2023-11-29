<script setup lang="ts">
const dots = [1, 2, 3, 4]
</script>

<template>
  <div class="h-full w-full flex flex-col">
    <div class="bg-black-100 opacity-90 h-2/5 p-6">
      <h1 class="text-xl uppercase font-black">Freedom Above All Else</h1>
      <p class="text-sm text-[#8D8D8D]">
        Should you ever need to switch to a different Web3 wallet, you can
        easily export your private keys from the Pop-Up Wallet and import them
        into your new wallet. However, it's essential to maintain the
        confidentiality of your private keys.
      </p>
      <div class="h-7 m-auto space-x-2 w-full flex justify-center items-center">
        <span
          v-for="dot in dots"
          :key="dot"
          class="block h-[5px] w-[5px] rounded-full"
          :class="dot === 3 ? 'bg-[#FFFFFF]' : 'bg-[#8D8D8D]'"
        ></span>
      </div>
    </div>
    <div class="h-3/5 w-full relative">
      <div
        class="w-32 h-32 border-1 z-[999] border-[#444444] rounded-full absolute top-36 left-6"
      ></div>
      <div class="h-full w-full bg-black-100 opacity-90 absolute"></div>
    </div>
  </div>
</template>
