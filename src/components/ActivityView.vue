<script lang="ts" setup>
import { ref, computed } from 'vue'

import { useActivitiesStore } from '@/store/activities'
import { useRpcStore } from '@/store/rpc'

const isExpanded = ref(false)
const activitiesStore = useActivitiesStore()
const rpcStore = useRpcStore()

const activities = computed(() =>
  activitiesStore.activities(rpcStore.rpcConfig?.chainId as number)
)
</script>

<template>
  <div class="flex flex-col px-4 py-5">
    <div class="flex flex-col gap-8">
      <div class="flex">
        <div class="mr-4">
          <img src="@/assets/images/activities/tx-send.svg" />
        </div>
        <div class="flex flex-col flex-grow gap-2">
          <div class="flex">
            <span class="font-bold text-base leading-5">{{ `Send` }}</span>
            <img
              src="@/assets/images/arrow-up.svg"
              class="cursor-pointer transition-transform duration-500 will-change-transform -mt-[2px]"
              :class="isExpanded ? 'rotate-0' : 'rotate-180'"
              role="button"
              @click="isExpanded = !isExpanded"
            />
          </div>
          <span class="text-xs color-secondary"
            >{{ `To` }}: {{ `19emj....WA5Cq` }}</span
          >
          <div class="flex text-xs color-secondary gap-1">
            <span>{{ `Aug 21` }}</span>
            <img src="@/assets/images/gray-circle-filled.svg" />
            <span>Status:</span>
            <span class="color-state-yellow">{{ `Pending` }}</span>
          </div>
        </div>
        <div class="flex flex-col items-end gap-1">
          <span
            class="font-bold text-base leading-5"
            :class="'color-state-red'"
            >{{ `2 ETH` }}</span
          >
          <span class="flex text-xs text-secondary">
            {{ `2,694 USD` }}
          </span>
        </div>
      </div>
      <div v-if="isExpanded" class="flex flex-col">
        <hr
          class="border-solid border-0 border-t-[1px] activity-view__border-gray mb-4"
        />
        <div v-if="false">
          <div class="flex flex-col">
            <span
              class="font-montserrat color-secondary text-xs font-semibold"
              >{{ `Recepient` }}</span
            >
            <span class="text-base font-normal leading-5">
              {{ `19emj...WA5Cq` }}
            </span>
          </div>
        </div>
        <div v-else>
          <div class="flex flex-col gap-5">
            <div class="flex justify-between">
              <div class="flex flex-col">
                <span
                  class="font-montserrat color-secondary text-xs font-semibold"
                  >From</span
                >
                <span class="text-base font-normal leading-5">
                  {{ `19emj...WA5Cq` }}
                </span>
              </div>
              <img src="@/assets/images/arrow-right.svg" />
              <div class="flex flex-col">
                <span
                  class="font-montserrat color-secondary text-xs font-semibold"
                  >To</span
                >
                <span class="text-base font-normal leading-5">
                  {{ `19emj...WA5Cq` }}
                </span>
              </div>
            </div>
            <div class="flex flex-col gap-4">
              <span
                class="font-montserrat color-secondary text-xs font-semibold"
                >Transaction Details</span
              >
              <div class="flex flex-col gap-5 text-base font-normal leading-5">
                <div class="flex justify-between">
                  <span>Nonce</span>
                  <span>{{ 5 }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Amount</span>
                  <span class="font-bold">{{ `2 ETH` }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Gas Limits (Units)</span>
                  <span>{{ 0 }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Gas Used (Units)</span>
                  <span>{{ 0 }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Gas Price</span>
                  <span>{{ 0 }}</span>
                </div>
              </div>
              <div
                class="flex justify-between py-4 border-solid border-x-0 border-y-[1px] activity-view__border-gray text-base font-bold leading-5"
              >
                <span>Total:</span>
                <span :class="'color-state-red'">{{ `2 ETH` }}</span>
              </div>
            </div>
            <div class="flex justify-center">
              <a :href="`#`" class="flex font-montserrat font-medium text-xs">
                View on Explorer
                <img src="@/assets/images/arrow-up-right.svg" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.activity-view__border-gray {
  border-color: rgb(247 247 247 / 20%);
}
</style>
