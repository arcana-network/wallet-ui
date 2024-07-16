<script setup lang="ts">
import useCurrencyStore from '@/store/currencies'
import { truncateMid } from '@/utils/stringUtils'

const props = defineProps<{ transactions: any }>()
const currencyStore = useCurrencyStore()
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
              (
                (transaction.gasLimit *
                  transaction.gasPrice *
                  Math.pow(10, -18)) /
                currencyStore.currencies['EGLD']
              ).toFixed(5)
            }}
            USD</span
          >
        </div>
      </div>
      <div>
        <div class="flex justify-between gap-4">
          <span class="w-[120px] capitalize">Total Gas Fees</span>
          <span
            >{{
              props.transactions
                .reduce(
                  (acc, transaction) =>
                    acc +
                    (transaction.gasLimit *
                      transaction.gasPrice *
                      Math.pow(10, -18)) /
                      currencyStore.currencies['EGLD'],
                  0
                )
                .toFixed(5)
            }}
            USD</span
          >
        </div>
      </div>
    </div>
  </div>
</template>
