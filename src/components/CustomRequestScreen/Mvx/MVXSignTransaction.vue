<script setup lang="ts">
import Decimal from 'decimal.js'

import useCurrencyStore from '@/store/currencies'
import { truncateMid } from '@/utils/stringUtils'

const currencyStore = useCurrencyStore()
const props = defineProps<{ transaction: any }>()

const gasFeesUSD = new Decimal(props.transaction.gasLimit)
  .mul(new Decimal(props.transaction.gasPrice))
  .mul(new Decimal(10).pow(-18))
  .div(currencyStore.currencies['EGLD'])
  .toDecimalPlaces(5)
</script>

<template>
  <div class="flex flex-col gap-2 text-sm">
    <div
      class="text-sm font-semibold uppercase text-black-arsenic dark:text-white-400"
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
    <div class="flex justify-between gap-4 text-base">
      <span class="w-[120px] capitalize">Gas Fees</span>
      <span>{{ gasFeesUSD }} USD</span>
    </div>
  </div>
</template>
