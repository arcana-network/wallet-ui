<script lang="ts" setup>
import { TokenTransfer } from '@multiversx/sdk-core/out'
import dayjs from 'dayjs'
import Decimal from 'decimal.js'
import { computed, ComputedRef } from 'vue'
import { useToast } from 'vue-toastification'

import { useActivitiesStore } from '@/store/activities'
import type {
  Activity,
  TransactionOps,
  FileOps,
  TransakOps,
} from '@/store/activities'
import { useAppStore } from '@/store/app'
import { useParentConnectionStore } from '@/store/parentConnection'
import { useRpcStore } from '@/store/rpc'
import { EVMAccountHandler } from '@/utils/accountHandler'
import { ChainType } from '@/utils/chainType'
import { getRequestHandler } from '@/utils/requestHandlerSingleton'
import { truncateEnd, truncateMid } from '@/utils/stringUtils'
import { getIconAsset } from '@/utils/useImage'

type ActivityViewProps = {
  currencyExchangeRate: number | string | null
  filterOperations: string[]
}

const OffRampProviders = {
  transak: 'Transak',
}

const app = useAppStore()
const props = defineProps<ActivityViewProps>()
const toast = useToast()

const activitiesStore = useActivitiesStore()
const rpcStore = useRpcStore()
const chainId = computed(() => rpcStore.selectedRpcConfig?.chainId)

type ActivityView = Activity & {
  isExpanded?: boolean
}

const parentConnectionStore = useParentConnectionStore()
const handleExplorerClick = async (e: MouseEvent) => {
  if (app.standaloneMode == 2) {
    const c = await parentConnectionStore.parentConnection?.promise
    if (e.target instanceof HTMLAnchorElement) {
      c?.uiEvent('open_url', { url: e.target?.href })
      e.preventDefault()
    }
  }
}

const [explorerUrl] = rpcStore.selectedRpcConfig?.blockExplorerUrls || []

const activities: ComputedRef<ActivityView[]> = computed(() => {
  const activitiesInStore = activitiesStore.activities(chainId.value as string)
  if (!activitiesInStore) {
    return []
  }
  return [...activitiesInStore]
})

function getTransactionIcon(operation: TransactionOps | FileOps | TransakOps) {
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
    const decimals = getRequestHandler().getAccountHandler().decimals
    return {
      amount: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(
        new Decimal(valueInCrypto.toString())
          .div(Decimal.pow(10, decimals))
          .mul(props.currencyExchangeRate)
          .toNumber()
      ),
      currency: 'USD',
    }
  }
  return {
    amount: getAmount(valueInCrypto),
    currency: rpcStore.currency,
  }
}

function calculateTotal(activity: Activity) {
  if (activity.transaction) {
    const gasUsed = activity.transaction?.gasUsed || 0n
    const gasPrice = activity.transaction?.gasPrice || 0n
    return activity.transaction.amount + gasUsed * gasPrice
  }
  return 0n
}

function getAmount(amount: bigint, isGas = false) {
  if (isGas) {
    if (app.chainType === ChainType.multiversx_cv25519) {
      return TokenTransfer.egldFromBigInteger(
        amount.toString()
      ).toPrettyString()
    } else {
      const gasDecimals = getRequestHandler().getAccountHandler().gasDecimals
      return new Decimal(amount.toString())
        .div(Decimal.pow(10, gasDecimals))
        .toDecimalPlaces(gasDecimals)
        .toString()
    }
  }
  const decimals = getRequestHandler().getAccountHandler().decimals
  return new Decimal(amount.toString())
    .div(Decimal.pow(10, decimals))
    .toDecimalPlaces(decimals)
    .toString()
}

function canShowDropdown(activity: Activity) {
  return (
    (explorerUrl && activity.txHash) ||
    activity.transaction ||
    activity.file?.recipient ||
    activity.file?.ruleHash ||
    activity.sellDetails
  )
}

function getDisplayAmount(activity: any) {
  const decimals = getRequestHandler().getAccountHandler().decimals
  const gasDecimals = getRequestHandler().getAccountHandler().gasDecimals
  return `${new Decimal(activity.transaction.amount.toString())
    .div(Decimal.pow(10, decimals))
    .toDecimalPlaces(gasDecimals)
    .toString()} ${rpcStore.currency}`
}

function getAmountInNativeCurrency(amount: bigint) {
  const decimals = getRequestHandler().getAccountHandler().decimals
  return new Decimal(amount.toString())
    .div(Decimal.pow(10, decimals))
    .toString()
}

function calculateSolanaTotal(activity) {
  const total: bigint = activity.fee + activity.amount
  return new Decimal(total.toString()).div(Decimal.pow(10, 9))
}

function generateExplorerURL(explorerUrl: string, txHash: string) {
  const urlFormatExplorerUrl = new URL(explorerUrl)
  const url =
    app.chainType === ChainType.multiversx_cv25519
      ? `/transactions/${txHash}`
      : `/tx/${txHash}`
  const actualTxUrl = new URL(url, explorerUrl)
  if (urlFormatExplorerUrl.search) {
    actualTxUrl.search = urlFormatExplorerUrl.search
  }
  return actualTxUrl.href
}

async function stopTransaction(activity) {
  try {
    const accountHandler =
      getRequestHandler().getAccountHandler() as EVMAccountHandler
    const transaction = await accountHandler.cancelTransaction(
      activity.txHash as string
    )
    activitiesStore.fetchAndSaveActivityFromHash({
      chainId: chainId.value as string,
      txHash: transaction,
      recipientAddress: activity.address.to,
      isCancelRequest: true,
    })

    setTimeout(() => {
      const cancelledActivityIndex = activities.value.findIndex(
        (act) => act.txHash !== activity.txHash
      )
      activitiesStore.deleteActivity(
        chainId.value as string,
        cancelledActivityIndex
      )
    }, 3000)
  } catch (error) {
    toast.error(error.message)
  }
}
</script>

<template>
  <ul v-if="activities.length" class="flex flex-col gap-8">
    <li
      v-for="activity in activities"
      :key="activity.transaction?.hash || activity.file?.did"
      class="flex flex-col gap-2"
    >
      <div class="flex">
        <div class="mr-3">
          <div
            v-if="activity.nft?.imageUrl"
            class="rounded-sm w-xxxl h-xxxl overflow-hidden mt-1"
          >
            <img
              :src="activity.nft.imageUrl"
              class="object-contain object-center"
            />
          </div>
          <img
            v-else
            :src="getTransactionIcon(activity.operation)"
            :style="{
              filter: app.theme === 'light' ? 'invert(1)' : 'invert(0)',
            }"
            :title="activity.operation"
          />
        </div>
        <div class="flex flex-col flex-grow">
          <div class="flex">
            <span
              v-if="activity.customToken"
              class="font-bold text-base"
              :title="`${activity.operation} ${activity.customToken.symbol}`"
            >
              {{ truncateEnd(activity.operation, 12) }}
              {{ activity.customToken.symbol }}
            </span>
            <span
              v-else-if="activity.nft"
              class="font-bold text-base"
              :title="`${activity.operation} NFT`"
            >
              {{ truncateEnd(activity.operation, 12) }}
              NFT
            </span>
            <span
              v-else
              class="font-bold text-base"
              :title="activity.operation"
            >
              {{ truncateEnd(activity.operation, 12) }}
            </span>
            <img
              v-if="canShowDropdown(activity)"
              src="@/assets/images/arrow-up.svg"
              class="cursor-pointer transition-transform duration-500 will-change-transform -mt-[2px]"
              :style="{
                filter: app.theme === 'light' ? 'invert(1)' : 'invert(0)',
              }"
              :class="activity.isExpanded ? 'rotate-0' : 'rotate-180'"
              role="button"
              @click="activity.isExpanded = !activity.isExpanded"
            />
          </div>
          <span
            v-if="activity.transaction && activity.address.to"
            class="text-sm text-gray-100"
            :title="activity.address.to"
            >To: {{ truncateMid(activity.address.to) }}</span
          >
          <span
            v-if="activity.file"
            class="text-sm text-gray-100"
            :title="activity.file.did"
            >File DID: {{ truncateMid(activity.file.did) }}</span
          >
          <div class="flex text-sm text-gray-100 gap-1 items-center">
            <span class="whitespace-nowrap">{{
              dayjs(activity.date).format('MMM D, YYYY H:mm')
            }}</span>
          </div>
        </div>
        <div
          v-if="activity.transaction || activity.sellDetails"
          class="flex flex-col items-end gap-1"
        >
          <span
            v-if="activity.customToken"
            class="font-bold text-base leading-5 text-right whitespace-nowrap overflow-hidden text-ellipsis max-w-[10rem]"
            :title="`${activity.customToken.amount} ${activity.customToken.symbol}`"
            >{{
              new Decimal(activity.customToken.amount)
                .toDecimalPlaces(5)
                .toString()
            }}
            {{ activity.customToken.symbol }}</span
          >
          <span
            v-else-if="
              activity.transaction && app.chainType === ChainType.evm_secp256k1
            "
            class="font-bold text-base leading-5 text-right whitespace-nowrap overflow-hidden text-ellipsis max-w-[10rem]"
            :title="`${getAmountInNativeCurrency(
              activity.transaction.amount
            )} ${rpcStore.currency}`"
            >{{ getAmount(activity.transaction.amount) }}
            {{ rpcStore.currency }}</span
          >
          <span
            v-if="
              !activity.customToken && !activity.nft && activity.transaction
            "
            class="flex text-xs text-[#8d8d8d] text-right"
            >{{ calculateCurrencyValue(activity.transaction.amount).amount }}
            {{
              calculateCurrencyValue(activity.transaction.amount).currency
            }}</span
          >
          <span
            v-else-if="activity.sellDetails"
            class="flex text-xs text-[#8d8d8d] text-right"
            >{{ activity.sellDetails.fiat.amount }}
            {{ activity.sellDetails.fiat.currency }}</span
          >
          <span
            class="text-sm"
            :class="{
              'text-green-100': activity.status === 'Success',
              'text-yellow-100': [
                'Pending',
                'Unapproved',
                'Processing',
              ].includes(activity.status),
              'text-red-100': [
                'Rejected',
                'Failed',
                'Refunded',
                'Expired',
              ].includes(activity.status),
            }"
          >
            {{ activity.status }}
          </span>
        </div>
      </div>
      <div
        v-if="canShowDropdown(activity) && activity.isExpanded"
        class="flex flex-col card p-4"
      >
        <div v-if="activity.file?.recipient">
          <div class="flex flex-col gap-[5px]">
            <span class="font-montserrat color-secondary text-xs font-semibold"
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
            <span class="font-montserrat color-secondary text-xs font-semibold"
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
        <div v-else-if="activity.sellDetails">
          <div class="flex flex-col gap-4">
            <div class="flex justify-between">
              <div class="flex flex-col gap-1">
                <span class="text-sm text-gray-100">From</span>
                <span
                  class="text-base font-bold"
                  :title="activity.address.from"
                >
                  {{ truncateMid(activity.address.from) }}
                </span>
              </div>
              <img
                v-if="activity.address.to"
                src="@/assets/images/arrow-right.svg"
                :style="{
                  filter: app.theme === 'light' ? 'invert(1)' : 'invert(0)',
                }"
              />
              <div v-if="activity.address.to" class="flex flex-col gap-1">
                <span class="text-sm text-gray-100">To</span>
                <span class="text-base font-bold" :title="activity.address.to">
                  {{ truncateMid(activity.address.to) }}
                </span>
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <span class="text-sm text-gray-100">Transaction Details</span>
              <div class="flex flex-col gap-2 text-base">
                <div
                  v-if="activity.sellDetails.provider"
                  class="flex justify-between"
                >
                  <span>Provider</span>
                  <span>{{
                    OffRampProviders[activity.sellDetails.provider]
                  }}</span>
                </div>
                <div
                  v-if="activity.sellDetails.crypto.amount"
                  class="flex justify-between"
                >
                  <span>Crypto Amount (Sent)</span>
                  <span
                    >{{ activity.sellDetails.crypto.amount }}
                    {{ activity.sellDetails.crypto.currency }}</span
                  >
                </div>
                <div
                  v-if="activity.sellDetails.fiat.amount"
                  class="flex justify-between"
                >
                  <span>Fiat Amount (Received)</span>
                  <span
                    >{{ activity.sellDetails.fiat.amount }}
                    {{ activity.sellDetails.fiat.currency }}</span
                  >
                </div>
                <div
                  v-if="activity.sellDetails.fiat.fee"
                  class="flex justify-between"
                >
                  <span>Provider Fees</span>
                  <span
                    >{{ activity.sellDetails.fiat.fee }}
                    {{ activity.sellDetails.fiat.currency }}</span
                  >
                </div>
                <div
                  v-if="activity.sellDetails.orderId"
                  class="flex justify-between"
                >
                  <span>Order ID</span>
                  <span :title="activity.sellDetails.orderId">{{
                    truncateMid(activity.sellDetails.orderId, 6)
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="activity.transaction">
          <div class="flex flex-col gap-4">
            <div
              v-if="activity.nft?.imageUrl"
              class="flex justify-center items-center"
            >
              <img
                :src="activity.nft.imageUrl"
                :title="`${activity.nft.name} by ${activity.nft.collectionName}`"
                class="w-16 h-16 rounded-[10px]"
              />
            </div>
            <div class="flex justify-between">
              <div class="flex flex-col gap-1">
                <span class="text-sm text-gray-100">From</span>
                <span
                  class="text-base font-bold"
                  :title="activity.address.from"
                >
                  {{ truncateMid(activity.address.from) }}
                </span>
              </div>
              <img
                v-if="activity.address.to"
                src="@/assets/images/arrow-right.svg"
                :style="{
                  filter: app.theme === 'light' ? 'invert(1)' : 'invert(0)',
                }"
              />
              <div v-if="activity.address.to" class="flex flex-col gap-1">
                <span class="text-sm text-gray-100">To</span>
                <span class="text-base font-bold" :title="activity.address.to">
                  {{ truncateMid(activity.address.to) }}
                </span>
              </div>
            </div>
            <div v-if="!activity.nft" class="flex flex-col gap-2">
              <span class="text-sm text-gray-100">Transaction Details</span>
              <div class="flex flex-col gap-2 text-base">
                <div class="flex justify-between">
                  <span v-if="app.chainType === ChainType.solana_cv25519"
                    >Slot</span
                  >
                  <span v-else>Nonce</span>
                  <span>{{ activity.transaction.nonce }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Amount</span>
                  <span
                    v-if="activity.customToken"
                    class="font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-[10rem]"
                    :title="`${activity.customToken.amount} ${activity.customToken.symbol}`"
                  >
                    {{
                      new Decimal(activity.customToken.amount)
                        .toDecimalPlaces(5)
                        .toString()
                    }}
                    {{ activity.customToken.symbol }}
                  </span>
                  <span
                    v-else-if="app.chainType === ChainType.evm_secp256k1"
                    class="font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-[10rem]"
                    :title="getDisplayAmount(activity)"
                    >{{ getAmount(activity.transaction.amount) }}
                    {{ rpcStore.currency }}</span
                  >
                </div>
                <div
                  v-if="activity.transaction.gasLimit"
                  class="flex justify-between"
                >
                  <span>Gas Limits (Units)</span>
                  <span>{{ activity.transaction.gasLimit }}</span>
                </div>
                <div
                  v-if="activity.transaction?.gasUsed"
                  class="flex justify-between"
                >
                  <span>Gas Used (Units)</span>
                  <span>{{ activity.transaction?.gasUsed || 0 }}</span>
                </div>
                <div
                  v-if="activity.transaction.gasPrice"
                  class="flex justify-between"
                >
                  <span>Gas Price</span>
                  <span
                    class="whitespace-nowrap overflow-hidden text-ellipsis max-w-[10rem]"
                    :title="`${getAmount(activity.transaction.gasPrice, true)}`"
                    >{{ getAmount(activity.transaction.gasPrice, true) }}
                    {{
                      app.chainType === ChainType.multiversx_cv25519
                        ? ''
                        : 'Gwei'
                    }}</span
                  >
                </div>
                <div
                  v-if="activity.transaction?.computeUnitsConsumed"
                  class="flex justify-between"
                >
                  <span>Compute Units Consumed</span>
                  <span>{{
                    activity.transaction?.computeUnitsConsumed || 0
                  }}</span>
                </div>
                <div
                  v-if="activity.transaction?.fee"
                  class="flex justify-between"
                >
                  <span>Fee</span>
                  <span
                    >{{ getAmount(activity.transaction?.fee) }}
                    {{ rpcStore.nativeCurrency?.symbol }}</span
                  >
                </div>
              </div>
              <div
                v-if="app.chainType === ChainType.evm_secp256k1"
                class="flex justify-between mt-4 font-bold text-base"
              >
                <span>Total:</span>
                <span
                  class="whitespace-nowrap overflow-hidden text-ellipsis max-w-[10rem]"
                  :title="`${getAmountInNativeCurrency(
                    calculateTotal(activity)
                  )} ${rpcStore.currency}`"
                  >{{ getAmount(calculateTotal(activity)) }}
                  {{ rpcStore.currency }}</span
                >
              </div>
              <div
                v-if="app.chainType === ChainType.solana_cv25519"
                class="flex justify-between mt-4 font-bold text-base"
              >
                <span>Total:</span>
                <span
                  class="whitespace-nowrap overflow-hidden text-ellipsis max-w-[10rem]"
                  :title="calculateSolanaTotal(activity.transaction).toString()"
                  >{{
                    calculateSolanaTotal(activity.transaction).toDecimalPlaces(
                      9
                    )
                  }}
                  {{ rpcStore.currency }}</span
                >
              </div>
            </div>
          </div>
        </div>
        <div v-if="activity.explorerUrl" class="flex justify-center mt-4">
          <a
            :href="activity.explorerUrl"
            class="flex font-montserrat font-medium text-xs"
            target="_blank"
            @click.stop="handleExplorerClick"
          >
            View on Explorer
            <img
              src="@/assets/images/arrow-up-right.svg"
              :style="{
                filter: app.theme === 'light' ? 'invert(1)' : 'invert(0)',
              }"
            />
          </a>
        </div>
        <div
          v-else-if="explorerUrl && activity.txHash"
          class="flex justify-center mt-4"
        >
          <a
            :href="generateExplorerURL(explorerUrl, activity.txHash)"
            class="flex font-montserrat font-medium text-xs"
            target="_blank"
            @click.stop="handleExplorerClick"
          >
            View on Explorer
            <img
              src="@/assets/images/arrow-up-right.svg"
              :style="{
                filter: app.theme === 'light' ? 'invert(1)' : 'invert(0)',
              }"
            />
          </a>
        </div>
        <div
          v-if="activity.status === 'Pending'"
          class="flex justify-between space-x-2 mt-4"
        >
          <button
            class="btn-secondary flex-1 text-sm font-bold py-2 uppercase"
            @click.stop="stopTransaction(activity)"
          >
            Stop
          </button>
          <button class="btn-primary flex-1 text-sm font-bold py-2 uppercase">
            Speed Up
          </button>
        </div>
      </div>
    </li>
  </ul>
  <div v-else class="flex justify-center text-center text-sm text-gray-100">
    You have no transactions
  </div>
</template>
