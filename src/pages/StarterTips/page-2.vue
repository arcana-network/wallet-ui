<script setup lang="ts">
const dots = [1, 2, 3, 4, 5, 6]
</script>

<template>
  <div class="h-full w-full flex flex-col justify-end">
    <div class="flex-1 startertips">
      <div
        class="absolute z-[2147483648] w-[192px] h-[192px] top-[70px] left-5"
      ></div>
    </div>
    <div
      class="text-black-100 dark:text-white-100 bg-gray-900 dark:bg-black-100 p-6 flex flex-col justify-end"
    >
      <h1 class="font-Nohemi text-2xl font-medium uppercase">Your Account</h1>
      <p class="text-sm">
        This is also known as your wallet address, public key or public address.
        You will need to share this with others who want to send you crypto or
        NFTs.
      </p>
      <div class="h-7 m-auto space-x-2 w-full flex justify-center items-center">
        <span
          v-for="dot in dots"
          :key="dot"
          class="block h-[5px] w-[5px] rounded-full"
          :class="dot === 2 ? 'dark:bg-white-100 bg-black-100' : 'bg-[#8D8D8D]'"
        ></span>
      </div>
    </div>
  </div>
</template>
