<script setup lang="ts">
import Decimal from 'decimal.js'
import { computed } from 'vue'

import useCurrencyStore from '@/store/currencies'
import { truncateMid } from '@/utils/stringUtils'

const props = defineProps<{ transactions: any[] }>()
const currencyStore = useCurrencyStore()

const totalGasFeesUSD = computed(() => {
  return props.transactions
    .reduce((acc: Decimal, transaction: any) => {
      const gasFeeUSD = new Decimal(transaction.gasLimit)
        .mul(new Decimal(transaction.gasPrice))
        .mul(new Decimal(10).pow(-18))
        .div(currencyStore.currencies['EGLD'])
      return acc.add(gasFeeUSD)
    }, new Decimal(0))
    .toDecimalPlaces(5)
})
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
        <div class="flex justify-between gap-4">
          <span class="w-[120px] capitalize">Gas Fees</span>
          <span
            >{{
              new Decimal(transaction.gasLimit)
                .mul(new Decimal(transaction.gasPrice))
                .mul(new Decimal(10).pow(-18))
                .div(currencyStore.currencies['EGLD'])
                .toDecimalPlaces(5)
            }}
            USD</span
          >
        </div>
      </div>
      <div>
        <div class="flex justify-between gap-4">
          <span class="w-[120px] capitalize">Total Gas Fees</span>
          <span>{{ totalGasFeesUSD }} USD</span>
        </div>
      </div>
    </div>
  </div>
</template>
