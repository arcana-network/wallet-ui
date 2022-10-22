<script lang="ts" setup>
import dayjs from 'dayjs'
import { ethers } from 'ethers'
import { computed, ComputedRef } from 'vue'

import { useActivitiesStore } from '@/store/activities'
import type { Activity, TransactionOps, FileOps } from '@/store/activities'
import { useRpcStore } from '@/store/rpc'
import { beautifyBalance } from '@/utils/formatTokenDecimals'
import { truncateEnd, truncateMid } from '@/utils/stringUtils'
import { getIconAsset } from '@/utils/useImage'

type ActivityViewProps = {
  currencyExchangeRate: number | string | null
}

const props = defineProps<ActivityViewProps>()

const activitiesStore = useActivitiesStore()
const rpcStore = useRpcStore()
const chainId = rpcStore.selectedRpcConfig?.chainId as number

type ActivityView = Activity & {
  isExpanded?: boolean
}

const [explorerUrl] = rpcStore.selectedRpcConfig?.blockExplorerUrls || []

const activities: ComputedRef<ActivityView[]> = computed(() => {
  const activitiesInStore = activitiesStore.activities(chainId)
  if (!activitiesInStore) {
    return []
  }
  return [...activitiesInStore]
})

function getTransactionIcon(operation: TransactionOps | FileOps) {
  const interaction = [
    'Contract Deployment',
    'Contract Interaction',
    'Meta Transaction',
    'Update Rule',
  ]
  if (interaction.includes(operation)) {
    return getIconAsset('activities/tx-interact.svg')
  }

  if (operation === 'Transfer Ownership') {
    return getIconAsset('activities/tx-transfer-ownership.svg')
  }

  return getIconAsset(`activities/tx-${operation.toLowerCase()}.svg`)
}

function calculateCurrencyValue(valueInCrypto: bigint) {
  if (props.currencyExchangeRate) {
    return {
      amount: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(
        Math.round(
          Number(ethers.utils.formatEther(valueInCrypto.toString())) *
            props.currencyExchangeRate
        )
      ),
      currency: 'USD',
    }
  }
  return {
    amount: String(getAmount(valueInCrypto)),
    currency: rpcStore.currency,
  }
}

function calculateTotal(activity: Activity) {
  if (activity.transaction) {
    return (
      activity.transaction.amount +
      activity.transaction.gasUsed * activity.transaction.gasPrice
    )
  }
  return 0n
}

function getAmount(amount: bigint, isGas = false) {
  if (isGas) {
    return beautifyBalance(Number(ethers.utils.formatUnits(amount, 'gwei')), 3)
  }
  return beautifyBalance(Number(ethers.utils.formatEther(amount)), 5)
}

function canShowDropdown(activity: Activity) {
  return (
    (explorerUrl && activity.txHash) ||
    activity.transaction ||
    activity.file?.recipient ||
    activity.file?.ruleHash
  )
}
</script>

<template>
  <div class="px-4 py-5">
    <ul v-if="activities.length" class="flex flex-col gap-8">
      <li
        v-for="activity in activities"
        :key="activity.transaction?.hash || activity.file?.did"
        class="flex flex-col gap-5"
      >
        <div class="flex">
          <div class="mr-3">
            <img
              :src="getTransactionIcon(activity.operation)"
              class="invert dark:invert-0"
              :title="activity.operation"
            />
          </div>
          <div class="flex flex-col flex-grow gap-2">
            <div class="flex">
              <span
                v-if="activity.customToken"
                class="font-bold text-base leading-5"
                :title="`${activity.operation} ${activity.customToken.symbol}`"
              >
                {{ truncateEnd(activity.operation, 12) }}
                {{ activity.customToken.symbol }}
              </span>
              <span
                v-else
                class="font-bold text-base leading-5"
                :title="activity.operation"
              >
                {{ truncateEnd(activity.operation, 12) }}
              </span>
              <img
                v-if="canShowDropdown(activity)"
                src="@/assets/images/arrow-up.svg"
                class="cursor-pointer transition-transform duration-500 will-change-transform -mt-[2px] invert dark:invert-0"
                :class="activity.isExpanded ? 'rotate-0' : 'rotate-180'"
                role="button"
                @click="activity.isExpanded = !activity.isExpanded"
              />
            </div>
            <span
              v-if="activity.transaction && activity.address.to"
              class="text-xs color-secondary"
              :title="activity.address.to"
              >To: {{ truncateMid(activity.address.to) }}</span
            >
            <span
              v-if="activity.file"
              class="text-xs color-secondary"
              :title="activity.file.did"
              >File DID: {{ truncateMid(activity.file.did) }}</span
            >
            <div class="flex text-xs color-secondary gap-1 items-center">
              <span class="whitespace-nowrap">{{
                dayjs(activity.date).format('MMM D')
              }}</span>
              <img src="@/assets/images/gray-circle-filled.svg" />
              <span>Status:</span>
              <span
                :class="
                  activity.status === 'Success'
                    ? 'color-state-green'
                    : 'color-state-yellow'
                "
              >
                {{ activity.status }}
              </span>
            </div>
          </div>
          <div
            v-if="activity.transaction"
            class="flex flex-col items-end gap-1"
          >
            <span
              v-if="activity.customToken"
              class="font-bold text-base leading-5 text-right whitespace-nowrap overflow-hidden text-ellipsis max-w-[6ch]"
              :class="
                activity.operation === 'Receive'
                  ? 'color-state-green'
                  : 'color-state-red'
              "
              :title="`${activity.customToken.amount} ${activity.customToken.symbol}`"
              >{{ beautifyBalance(Number(activity.customToken.amount), 3) }}
              {{ activity.customToken.symbol }}</span
            >
            <span
              v-else
              class="font-bold text-base leading-5 text-right whitespace-nowrap overflow-hidden text-ellipsis max-w-[6ch]"
              :class="
                activity.operation === 'Receive'
                  ? 'color-state-green'
                  : 'color-state-red'
              "
              :title="`${ethers.utils.formatEther(
                activity.transaction.amount
              )} ${rpcStore.currency}`"
              >{{ getAmount(activity.transaction.amount) }}
              {{ rpcStore.currency }}</span
            >
            <span
              v-if="!activity.customToken"
              class="flex text-xs text-secondary text-right"
              >{{ calculateCurrencyValue(activity.transaction.amount).amount }}
              {{
                calculateCurrencyValue(activity.transaction.amount).currency
              }}</span
            >
          </div>
        </div>
        <div
          v-if="canShowDropdown(activity) && activity.isExpanded"
          class="flex flex-col"
        >
          <hr
            class="border-solid border-0 border-t-[1px] tab-view-border-color"
            :class="{
              'mb-4':
                activity.file?.recipient ||
                activity.file?.ruleHash ||
                activity.transaction,
            }"
          />
          <div v-if="activity.file?.recipient">
            <div class="flex flex-col gap-[5px]">
              <span
                class="font-montserrat color-secondary text-xs font-semibold"
                >To</span
              >
              <span
                class="text-base font-normal leading-5"
                :title="activity.file.recipient"
              >
                {{ truncateMid(activity.file.recipient) }}
              </span>
            </div>
          </div>
          <div v-if="activity.file?.ruleHash">
            <div class="flex flex-col gap-[5px]">
              <span
                class="font-montserrat color-secondary text-xs font-semibold"
                >Rule Hash</span
              >
              <span
                class="text-base font-normal leading-5"
                :title="activity.file.ruleHash"
              >
                {{ truncateMid(activity.file.ruleHash) }}
              </span>
            </div>
          </div>
          <div v-else-if="activity.transaction">
            <div class="flex flex-col gap-5">
              <div class="flex justify-between">
                <div class="flex flex-col gap-[5px]">
                  <span
                    class="font-montserrat color-secondary text-xs font-semibold"
                    >From</span
                  >
                  <span
                    class="text-base font-normal leading-5"
                    :title="activity.address.from"
                  >
                    {{ truncateMid(activity.address.from) }}
                  </span>
                </div>
                <img
                  v-if="activity.address.to"
                  src="@/assets/images/arrow-right.svg"
                />
                <div v-if="activity.address.to" class="flex flex-col gap-[5px]">
                  <span
                    class="font-montserrat color-secondary text-xs font-semibold"
                    >To</span
                  >
                  <span
                    class="text-base font-normal leading-5"
                    :title="activity.address.to"
                  >
                    {{ truncateMid(activity.address.to) }}
                  </span>
                </div>
              </div>
              <div class="flex flex-col gap-4">
                <span
                  class="font-montserrat color-secondary text-xs font-semibold"
                  >Transaction Details</span
                >
                <div
                  class="flex flex-col gap-5 text-base font-normal leading-5"
                >
                  <div class="flex justify-between">
                    <span>Nonce</span>
                    <span>{{ activity.transaction.nonce }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Amount</span>
                    <span
                      class="font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-[8ch]"
                      :title="`${ethers.utils.formatEther(
                        activity.transaction.amount
                      )} ${rpcStore.currency}`"
                      >{{ getAmount(activity.transaction.amount) }}
                      {{ rpcStore.currency }}</span
                    >
                  </div>
                  <div class="flex justify-between">
                    <span>Gas Limits (Units)</span>
                    <span>{{ activity.transaction.gasLimit }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Gas Used (Units)</span>
                    <span>{{ activity.transaction?.gasUsed || 0 }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Gas Price</span>
                    <span
                      class="whitespace-nowrap overflow-hidden text-ellipsis max-w-[8ch]"
                      :title="`${getAmount(
                        activity.transaction.gasPrice,
                        true
                      )} Gwei`"
                      >{{
                        getAmount(activity.transaction.gasPrice, true)
                      }}
                      Gwei</span
                    >
                  </div>
                </div>
                <div
                  class="flex justify-between py-4 border-solid border-x-0 border-y-[1px] tab-view-border-color text-base font-bold leading-5"
                >
                  <span>Total:</span>
                  <span
                    class="whitespace-nowrap overflow-hidden text-ellipsis max-w-[8ch]"
                    :class="
                      activity.operation === 'Receive'
                        ? 'color-state-green'
                        : 'color-state-red'
                    "
                    :title="`${ethers.utils.formatEther(
                      calculateTotal(activity)
                    )} ${rpcStore.currency}`"
                    >{{ getAmount(calculateTotal(activity)) }}
                    {{ rpcStore.currency }}</span
                  >
                </div>
              </div>
            </div>
          </div>
          <div
            v-if="explorerUrl && activity.txHash"
            class="flex justify-center my-5"
          >
            <a
              :href="`${explorerUrl}/tx/${activity.txHash}`"
              class="flex font-montserrat font-medium text-xs"
              target="_blank"
            >
              View on Explorer
              <img
                src="@/assets/images/arrow-up-right.svg"
                class="invert dark:invert-0"
              />
            </a>
          </div>
        </div>
      </li>
    </ul>
    <div v-else class="flex justify-center text-center">
      You have no transactions
    </div>
  </div>
</template>
