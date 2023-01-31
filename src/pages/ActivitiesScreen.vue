<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import type { Ref } from 'vue'
import { ref, onMounted } from 'vue'

import ActivityView from '@/components/ActivityView.vue'
import { getExchangeRate } from '@/services/exchangeRate.service'
import type { CurrencySymbol } from '@/services/exchangeRate.service'
import { useRpcStore } from '@/store/rpc'
import { useImage } from '@/utils/useImage'

const getImage = useImage()

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

const showFilter = ref(false)
const selectedFilter = ref(filters[0].value)

const exchangeRate: Ref<number | null> = ref(null)
const { currency } = storeToRefs(rpcStore)
const EXCHANGE_RATE_CURRENCY: CurrencySymbol = 'USD'

function onFilterSelect(filter) {
  selectedFilter.value = filter.value
}

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
  <div
    class="wallet__card p-4 rounded-[10px] space-y-5 flex flex-col overflow-auto"
    @click="showFilter = false"
  >
    <div class="flex justify-between relative items-center">
      <h1 class="font-semibold text-xl sm:text-sm">Activities</h1>
      <div class="flex items-center space-x-1">
        <p
          v-if="selectedFilter != 'all'"
          class="bg-black text-gray-500 text-[10px] sm:text-[8px] p-1 rounded"
        >
          {{ filters.find((filter) => filter.value === selectedFilter)?.label }}
        </p>
        <button class="h-auto" @click.stop="showFilter = true">
          <img
            :src="getImage('filter-icon')"
            alt="filter"
            class="p-1 rounded-[10px]"
          />
        </button>
      </div>
      <div
        v-if="showFilter"
        class="flex flex-col absolute right-0 top-2 p-5 sm:p-3 bg-black rounded-[10px]"
      >
        <button
          v-for="filter in filters"
          :key="filter.value"
          class="text-left hover:bg-gray-600 p-2 rounded-[10px] sm:text-[12px] h-auto"
          @click="() => onFilterSelect(filter)"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>
    <div class="flex-1">
      <ActivityView
        :currency-exchange-rate="exchangeRate"
        :filter-operations="filters_operations_map[selectedFilter]"
      />
    </div>
  </div>
</template>
