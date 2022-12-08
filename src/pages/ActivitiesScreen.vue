<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import type { Ref } from 'vue'
import { ref, onMounted } from 'vue'

import ActivityView from '@/components/ActivityView.vue'
import { getExchangeRate } from '@/services/exchangeRate.service'
import type { CurrencySymbol } from '@/services/exchangeRate.service'
import { useRpcStore } from '@/store/rpc'

onMounted(() => {
  getCurrencyExchangeRate()
})

const rpcStore = useRpcStore()

const exchangeRate: Ref<number | null> = ref(null)
const { currency } = storeToRefs(rpcStore)
const EXCHANGE_RATE_CURRENCY: CurrencySymbol = 'USD'

const loader = ref({
  show: false,
  message: '',
})

function showLoader(message) {
  loader.value.show = true
  loader.value.message = `${message}...`
}

function hideLoader() {
  loader.value.show = false
  loader.value.message = ''
}

async function getCurrencyExchangeRate() {
  showLoader('Fetching Currency Rate')
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
  } finally {
    hideLoader()
  }
}
</script>

<template>
  <div v-if="loader.show" class="flex justify-center items-center flex-1">
    <p class="sm:text-xs">{{ loader.message }}</p>
  </div>
  <div
    v-else
    class="wallet__card p-4 rounded-[10px] space-y-5 flex flex-col overflow-auto"
  >
    <h1 class="font-semibold text-xl">Activities</h1>
    <div class="flex-1">
      <ActivityView :currency-exchange-rate="exchangeRate" />
    </div>
  </div>
</template>
