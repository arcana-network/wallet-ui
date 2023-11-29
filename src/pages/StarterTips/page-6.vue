<script setup lang="ts">
const dots = [1, 2, 3, 4]
</script>

<template>
  <div class="h-full w-full flex flex-col">
    <div class="h-3/4 w-full relative">
      <div
        class="w-40 h-40 border-2 z-[999] border-[#444444] rounded-full absolute top-64 right-6"
      ></div>
      <div class="h-full w-full bg-black-100 opacity-90 absolute"></div>
    </div>
    <div class="bg-black-100 opacity-90 h-1/4 p-6">
      <h1 class="text-xl uppercase font-black">On-RAMP Support</h1>
      <p class="text-sm text-[#8D8D8D]">
        Easily purchase a wide range of crypto assets directly within the wallet
        using our integrated on-ramp providers.
      </p>
      <div class="h-7 m-auto space-x-2 w-full flex justify-center items-center">
        <span
          v-for="dot in dots"
          :key="dot"
          class="block h-[5px] w-[5px] rounded-full"
          :class="dot === 4 ? 'bg-[#FFFFFF]' : 'bg-[#8D8D8D]'"
        ></span>
      </div>
    </div>
  </div>
</template>
