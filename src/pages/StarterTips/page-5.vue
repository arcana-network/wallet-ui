<script setup lang="ts">
const dots = [1, 2, 3, 4, 5, 6]
</script>

<template>
  <div class="h-full w-full flex flex-col">
    <div class="h-2/5 p-6 bg-gray-900 dark:bg-black-100">
      <h1 class="font-Nohemi text-[20px] font-medium uppercase">
        Freedom Above All Else
      </h1>
      <p class="text-sm">
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
          :class="dot === 5 ? 'dark:bg-white-100 bg-black-100' : 'bg-[#8D8D8D]'"
        ></span>
      </div>
    </div>
  </div>
</template>
