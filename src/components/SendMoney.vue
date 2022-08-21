<script setup lang="ts">
const emits = defineEmits(['cancel'])
</script>

<template>
  <div
    class="container space-y-5 sm:space-y-3 rounded-lg overflow-auto h-full p-4 flex flex-col justify-between"
  >
    <div class="space-y-1">
      <p class="text-xl sm:text-sm">Send Tokens</p>
      <p class="text-xs text-zinc-400">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor
      </p>
    </div>
    <div class="space-y-1">
      <p class="text-xs text-zinc-400">Network</p>
      <p class="text-base sm:text-sm">Ethereum</p>
    </div>
    <div class="space-y-1">
      <p class="text-xs text-zinc-400">Recipient’s Wallet Address</p>
      <input
        type="text"
        class="text-base sm:text-sm dark:bg-gradient-dark bg-gradient-light w-full p-3 sm:p-1 rounded-lg shadow-inner"
        placeholder="6yhjtikn7...."
      />
    </div>
    <div class="space-y-1">
      <p class="text-xs text-zinc-400">Amount</p>
      <input
        type="text"
        class="text-base sm:text-sm dark:bg-gradient-dark bg-gradient-light w-full p-3 sm:p-1 rounded-lg"
        placeholder="Ex: 0.5 ETH"
      />
    </div>
    <div class="space-y-1">
      <p class="text-xs text-zinc-400">Gas Fees</p>
      <p class="text-xs text-zinc-400">
        Fees paid to validators and refer Polygon Gastation for recent prices
      </p>
      <input
        type="text"
        class="text-base sm:text-sm dark:bg-gradient-dark bg-gradient-light w-full p-3 sm:p-1 rounded-lg"
        placeholder="Ex: $3.50"
      />
    </div>
    <div class="flex space-x-3">
      <button
        class="text-sm rounded-xl border-2 border-solid border-black dark:border-white flex-1"
        @click="emits('cancel')"
      >
        Cancel
      </button>
      <button
        class="text-sm rounded-xl text-white dark:bg-white bg-black dark:text-black flex-1"
      >
        Send
      </button>
    </div>
  </div>
</template>

<style scoped>
.container {
  background: var(--content-bg-color);
  box-shadow: 4px 5px 4px rgb(0 0 0 / 25%);
}
</style>
