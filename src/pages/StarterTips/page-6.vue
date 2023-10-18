<script setup lang="ts">
const dots = [1, 2, 3, 4]
</script>

<template>
  <div class="space-y-4 h-full flex flex-col">
    <div class="flex-1 flex items-end justify-end">
      <img src="@/assets/images/starter-tips/page-6.png" alt="buy" />
    </div>
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
</template>
