<script setup lang="ts">
import { truncateMid } from '@/utils/stringUtils'

const props = defineProps<{ transaction: any }>()
</script>

<template>
  <div class="flex flex-col gap-2 text-sm">
    <div
      class="text-sm font-medium uppercase text-black-arsenic dark:text-white-400"
    >
      Transaction Details
    </div>
    <div
      v-for="[key, value] in Object.entries(props.transaction)"
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
</template>
