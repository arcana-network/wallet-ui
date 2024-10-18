<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { type Ref, ref, onMounted, computed, type ComputedRef } from 'vue'

import ActivityView from '@/components/ActivityView.vue'
import SkippedRequestView from '@/components/SkippedRequestView.vue'
import { useActivitiesStore, type Activity } from '@/store/activities'
import { useAppStore } from '@/store/app'
import { useRequestStore } from '@/store/request'
import { useRpcStore } from '@/store/rpc'
import { getFontFaimly, getFontSizeStyle } from '@/utils/utilsFunction'

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
const appStore = useAppStore()
const showFilter = ref(false)
const selectedFilter = ref(filters[0].value)
const activitiesStore = useActivitiesStore()
const chainId = computed(() => rpcStore.selectedRpcConfig?.chainId)

const activities: ComputedRef<Activity[]> = computed(() => {
  const activitiesInStore = activitiesStore.activities(chainId.value as string)
  if (!activitiesInStore) {
    return []
  }
  return [...activitiesInStore]
})

const exchangeRate: Ref<number | null> = ref(null)
const { currency } = storeToRefs(rpcStore)

async function getCurrencyExchangeRate() {
  try {
    if (currency.value) {
      const rate = 0
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
      <h1 class="font-Nohemi text-[20px] font-medium text-center flex-grow">
        Activities
      </h1>
    </div>
    <div
      v-if="requestStore.skippedRequestsPendingForApprovalLength"
      class="flex flex-col gap-2"
    >
      <span
        class="font-medium uppercase"
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
        >Pending
        <span class="text-red-pink-orange"
          >({{ requestStore.skippedRequestsPendingForApprovalLength }})</span
        ></span
      >
      <SkippedRequestView />
    </div>
    <div class="flex-1 flex flex-col gap-2">
      <span
        class="uppercase"
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
      >
        Confirmed
        <span
          :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
          :style="{
            fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
              .primaryFontClass,
            color: appStore.theme_settings.font_color,
          }"
          >({{ activities.length }})</span
        >
      </span>
      <ActivityView
        :currency-exchange-rate="exchangeRate"
        :filter-operations="filters_operations_map[selectedFilter]"
      />
    </div>
  </div>
</template>
