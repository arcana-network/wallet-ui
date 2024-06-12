<script setup lang="ts">
const dots = [1, 2, 3, 4, 5, 6]
</script>

<template>
  <div class="space-y-4 h-full p-6 pt-2 text-black-100 dark:text-white-100">
    <h1 class="font-Nohemi text-xl uppercase">New user orientation</h1>
    <p class="text-sm">
      The following screens will help you understand the main functionalities
      that are available in your wallet.
    </p>
    <div class="h-7 m-auto space-x-2 w-full flex justify-center items-center">
      <span
        v-for="dot in dots"
        :key="dot"
        class="block h-[5px] w-[5px] rounded-full"
        :class="dot === 1 ? 'dark:bg-white-100 bg-black-100' : 'bg-[#8D8D8D]'"
      ></span>
    </div>
  </div>
</template>
