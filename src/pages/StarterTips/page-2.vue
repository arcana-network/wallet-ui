<script setup lang="ts">
const dots = [1, 2, 3, 4]
</script>

<template>
  <div class="h-full w-full flex flex-col justify-end bg-black-100 opacity-90">
    <div class="bg-black-100 p-6 flex flex-col justify-end">
      <h1 class="text-xl uppercase font-black">Your Account</h1>
      <p class="text-sm text-[#8D8D8D]">
        This is also known as your wallet address, public key or public address.
        You will need to share this with others who want to send you crypto or
        NFTs.
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
