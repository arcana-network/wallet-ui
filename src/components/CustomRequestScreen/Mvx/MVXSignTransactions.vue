<script setup lang="ts">
import { truncateMid } from '@/utils/stringUtils'

const props = defineProps<{ transactions: any }>()
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="text-sm font-medium">Transactions</div>
    <div class="flex flex-col gap-8">
      <div
        v-for="(transaction, index) in props.transactions"
        :key="JSON.stringify(transaction)"
        class="flex flex-col gap-2 text-sm"
      >
        <div class="text-sm font-medium">#{{ index + 1 }}</div>
        <div
          v-for="[key, value] in Object.entries(transaction)"
          :key="key"
          class="flex justify-between gap-4"
        >
          <span class="w-[120px] capitalize">{{ key }}</span>
          <span :title="String(value)">
            {{
              key === 'sender' || key === 'receiver'
                ? truncateMid(value as string, 8)
                : value
            }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
