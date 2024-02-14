<script setup lang="ts">
const dots = [1, 2, 3, 4, 5, 6]
</script>

<template>
  <div class="h-full w-full flex flex-col">
    <div class="h-3/4 w-full">
      <div class="h-full w-full startertips">
        <div
          class="absolute z-[2147483648] w-36 h-36 top-[266px] right-8"
        ></div>
      </div>
    </div>
    <div class="bg-black-100 h-1/4 p-4">
      <h1 class="text-xl uppercase font-black">On-RAMP Support</h1>
      <p class="text-sm">
        Easily purchase a wide range of crypto assets directly within the wallet
        using our integrated on-ramp providers.
      </p>
      <div class="h-7 m-auto space-x-2 w-full flex justify-center items-center">
        <span
          v-for="dot in dots"
          :key="dot"
          class="block h-[5px] w-[5px] rounded-full"
          :class="dot === 6 ? 'bg-[#FFFFFF]' : 'bg-[#8D8D8D]'"
        ></span>
      </div>
    </div>
  </div>
</template>
