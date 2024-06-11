<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const SolanaTransactionDetails = defineAsyncComponent(
  () => import('@/components/CustomRequestScreen/Solana/TransactionDetails.vue')
)

const props = defineProps<{ message: string[] }>()
</script>

<template>
  <div class="flex flex-col gap-8">
    <div
      v-for="(m, index) in props.message"
      :key="m"
      class="flex flex-col gap-2"
    >
      <div class="text-md font-medium">Transaction #{{ index + 1 }}</div>
      <SolanaTransactionDetails :message="m" />
    </div>
  </div>
</template>
