<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const SolanaTransactionDetails = defineAsyncComponent(
  () => import('@/components/CustomRequestScreen/Solana/TransactionDetails.vue')
)

const props = defineProps<{ message: string }>()
</script>

<template>
  <div class="flex flex-col gap-2 text-sm">
    <div class="text-sm font-medium">Transaction Details</div>
    <SolanaTransactionDetails :message="props.message" />
  </div>
</template>
