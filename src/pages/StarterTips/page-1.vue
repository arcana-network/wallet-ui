<script setup lang="ts">
const dots = [1, 2, 3, 4]
</script>

<template>
  <div class="space-y-4 bg-black-100 h-full p-6 bg-opacity-80">
    <h1 class="text-xl uppercase font-black">New user orientation</h1>
    <p class="text-sm">
      The following screens will help you understand the main functionalities
      that are available in your wallet. You can quickly go through the same or
      click “Skip” if you’re familiar with wallets.
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
