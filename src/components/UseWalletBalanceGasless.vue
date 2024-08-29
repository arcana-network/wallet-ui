<script setup lang="ts">
import { useGaslessStore } from '@/store/gasless'

const gaslessStore = useGaslessStore()

function approve() {
  gaslessStore.canUseWalletBalance = true
}

function reject() {
  gaslessStore.canUseWalletBalance = false
}
</script>

<template>
  <div class="space-y-2">
    <p class="text-center">
      Seems like the gas tank is empty, would you like to use your wallet to pay
      gas fee?
    </p>
    <div class="flex gap-2 text-sm font-medium">
      <button class="w-full btn-secondary accent-color p-2" @click="reject">
        Reject
      </button>
      <button class="w-full btn-primary accent-color p-2" @click="approve">
        Approve
      </button>
    </div>
  </div>
</template>
