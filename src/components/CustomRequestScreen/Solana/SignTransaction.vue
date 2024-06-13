<script setup lang="ts">
import SolanaTransactionDetails from '@/components/CustomRequestScreen/Solana/TransactionDetails.vue'

const props = defineProps<{ message: string }>()
</script>

<template>
  <div class="flex flex-col gap-2 text-sm">
    <div
      class="text-sm font-semibold uppercase text-black-arsenic dark:text-white-400"
    >
      Transaction Details
    </div>
    <SolanaTransactionDetails :message="props.message" />
  </div>
</template>
