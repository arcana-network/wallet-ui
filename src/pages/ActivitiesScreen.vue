<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import type { Ref } from 'vue'
import { ref, onMounted, computed, type ComputedRef } from 'vue'

import ActivityView from '@/components/ActivityView.vue'
import SkippedRequestView from '@/components/SkippedRequestView.vue'
import { getExchangeRate } from '@/services/exchangeRate.service'
import type { CurrencySymbol } from '@/services/exchangeRate.service'
import { useActivitiesStore, type Activity } from '@/store/activities'
import { useRequestStore } from '@/store/request'
import { useRpcStore } from '@/store/rpc'

const filters = [
  {
    label: 'All',
    value: 'all',
  },
  {
    label: 'App Initiated',
    value: 'app-initiated',
  },
  {
    label: 'User Initiated',
    value: 'user-initiated',
  },
]

const filters_operations_map = {
  all: ['Send', 'Receive', 'Contract Deployment', 'Contract Interaction'],
  'app-initiated': ['Contract Deployment', 'Contract Interaction'],
  'user-initiated': ['Send', 'Receive'],
}

onMounted(() => {
  getCurrencyExchangeRate()
})

const rpcStore = useRpcStore()
const requestStore = useRequestStore()

const showFilter = ref(false)
const selectedFilter = ref(filters[0].value)
const activitiesStore = useActivitiesStore()
const chainId = rpcStore.selectedRpcConfig?.chainId

const activities: ComputedRef<Activity[]> = computed(() => {
  const activitiesInStore = activitiesStore.activities(chainId as string)
  if (!activitiesInStore) {
    return []
  }
  return [...activitiesInStore]
})

const exchangeRate: Ref<number | null> = ref(null)
const { currency } = storeToRefs(rpcStore)
const EXCHANGE_RATE_CURRENCY: CurrencySymbol = 'USD'

async function getCurrencyExchangeRate() {
  try {
    if (currency.value) {
      const rate = await getExchangeRate(
        currency.value as CurrencySymbol,
        EXCHANGE_RATE_CURRENCY
      )
      if (rate) exchangeRate.value = rate
    }
  } catch (err) {
    console.error(err)
    exchangeRate.value = null
  }
}
</script>

<template>
  <div class="flex flex-col gap-5" @click="showFilter = false">
    <div class="flex justify-between relative items-center">
      <h1 class="font-bold text-xl text-center flex-grow">Activities</h1>
    </div>
    <div
      v-if="requestStore.skippedRequestsPendingForApprovalLength"
      class="flex-1 flex flex-col gap-2"
    >
      <span class="text-xs text-gray-100 font-bold"
        >Pending ({{
          requestStore.skippedRequestsPendingForApprovalLength
        }})</span
      >
      <SkippedRequestView />
    </div>
    <div class="flex-1 flex flex-col gap-2">
      <span class="text-xs text-gray-100 font-bold"
        >Confirmed ({{ activities.length }})</span
      >
      <ActivityView
        :currency-exchange-rate="exchangeRate"
        :filter-operations="filters_operations_map[selectedFilter]"
      />
    </div>
  </div>
</template>
