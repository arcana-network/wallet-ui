<script setup lang="ts">
import Decimal from 'decimal.js'
import { type SignAndSendTransactionOptions } from 'near-api-js/lib/account'
import { computed } from 'vue'

import SignMessageAdvancedInfo from '@/components/signMessageAdvancedInfo.vue'
import { estimatedNearTxFees } from '@/utils/near/estimatedTxFees'
import { getActionName } from '@/utils/near/getActionName'
import { getRequestHandler } from '@/utils/requestHandlerSingleton'
import { truncateMid } from '@/utils/stringUtils'

const props = defineProps<{
  transaction: SignAndSendTransactionOptions
}>()

const accountHander = getRequestHandler().getAccountHandler()
const nearDecimals = accountHander.decimals

const estimatedTxFees = computed(() => {
  const totalTxFees = props.transaction.actions.reduce((acc, action) => {
    for (let key in action) {
      acc = new Decimal(acc)
        .add(new Decimal(estimatedNearTxFees[key] || 0))
        .toNumber()
    }
    return acc
  }, 0)
  return totalTxFees || 0
})
</script>

<template>
  <div class="flex flex-col gap-2 text-sm">
    <div
      class="text-sm font-medium uppercase text-black-arsenic dark:text-white-400"
    >
      Transaction Details
    </div>
    <div class="flex justify-between gap-4">
      <span class="w-[120px]">Receiver</span>
      <span
        class="w-[200px] text-right whitespace-nowrap overflow-hidden text-ellipsis"
        :title="props.transaction.receiverId"
      >
        {{ truncateMid(props.transaction.receiverId, 8) }}
      </span>
    </div>
    <div class="flex justify-between gap-4">
      <span>Estimated Transaction Fees</span>
      <span
        class="w-[200px] text-right whitespace-nowrap overflow-hidden text-ellipsis"
      >
        {{ estimatedTxFees }} NEAR
      </span>
    </div>
    <div v-if="props.transaction.actions.length > 1">
      <div class="text-sm font-medium mt-4">Batched Transactions</div>
    </div>
    <div
      v-for="(action, index) in props.transaction.actions"
      :key="`near-transaction-${index}`"
    >
      <div v-if="props.transaction.actions.length > 1">
        <div class="flex justify-between gap-4 mt-2">
          <span class="w-full"
            >{{ index + 1 }}) {{ getActionName(action) }}</span
          >
        </div>
      </div>
      <div v-else>
        <div class="flex justify-between gap-4 mt-2 font-medium">
          <span class="w-full">{{ getActionName(action) }}</span>
        </div>
      </div>
      <div :class="{ 'ml-3': props.transaction.actions.length > 1 }">
        <div v-if="action.transfer">
          <div class="flex justify-between gap-4">
            <span class="w-[120px]">Amount</span>
            <span
              class="w-[200px] text-right whitespace-nowrap overflow-hidden text-ellipsis"
            >
              {{
                new Decimal(action.transfer.deposit?.toString() || '0')
                  .div(Decimal.pow(10, nearDecimals))
                  .toDecimalPlaces(nearDecimals / 2)
              }}
              NEAR
            </span>
          </div>
        </div>
        <div v-else-if="action.deployContract">
          <SignMessageAdvancedInfo :info="action.deployContract.code" />
        </div>
        <div v-else-if="action.stake" class="flex flex-col gap-1">
          <div class="flex justify-between gap-3">
            <span class="w-[120px]">Stake Amount</span>
            <span
              class="w-[200px] text-right whitespace-nowrap overflow-hidden text-ellipsis"
            >
              {{
                new Decimal(action.stake.stake?.toString() || '0')
                  .div(Decimal.pow(10, nearDecimals))
                  .toDecimalPlaces(nearDecimals / 2)
              }}
              NEAR
            </span>
          </div>
          <div class="flex justify-between gap-4">
            <span class="w-[120px]">Public Key</span>
            <span
              class="w-[200px] text-right whitespace-nowrap overflow-hidden text-ellipsis"
            >
              {{ action.stake.publicKey?.toString() }}
            </span>
          </div>
        </div>
        <div v-else-if="action.functionCall" class="flex flex-col gap-1">
          <div class="flex justify-between gap-4">
            <span class="w-[120px]">Method</span>
            <span
              class="w-[200px] text-right whitespace-nowrap overflow-hidden text-ellipsis"
            >
              {{ action.functionCall.methodName }}
            </span>
          </div>
          <div class="flex justify-between gap-4">
            <span class="w-[120px]">Deposit</span>
            <span
              class="w-[200px] text-right whitespace-nowrap overflow-hidden text-ellipsis"
            >
              {{
                new Decimal(action.functionCall.deposit?.toString() || '0')
                  .div(Decimal.pow(10, nearDecimals))
                  .toDecimalPlaces(12)
              }}
              NEAR
            </span>
          </div>
          <div class="flex justify-between gap-4">
            <span class="w-[120px]">Gas</span>
            <span
              class="w-[200px] text-right whitespace-nowrap overflow-hidden text-ellipsis"
            >
              {{ action.functionCall.gas?.toString() }}
            </span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="w-[120px]">Arguments</span>
            <SignMessageAdvancedInfo
              :info="action.functionCall.args.toString()"
            />
          </div>
        </div>
        <div v-else>
          <SignMessageAdvancedInfo :info="action" />
        </div>
      </div>
    </div>
  </div>
</template>
