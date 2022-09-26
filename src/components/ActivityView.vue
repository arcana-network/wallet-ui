<script lang="ts" setup>
import { ref } from 'vue'

const isExpanded = ref(false)
</script>

<template>
  <div class="flex flex-col px-4 py-5 gap-8">
    <div class="flex flex-col">
      <div class="flex">
        <div class="mr-4">
          <img src="@/assets/images/activities/tx-send.svg" />
        </div>
        <div class="flex flex-col flex-grow">
          <div class="flex">
            <span>Send</span>
            <img
              src="@/assets/images/arrow-icon-dark-mode.png"
              class="cursor-pointer transition-transform duration-500 will-change-transform"
              :class="isExpanded ? '-rotate-180' : 'rotate-0'"
              role="button"
              @click="isExpanded = !isExpanded"
            />
          </div>
          <span>To: 19emj....WA5Cq</span>
          <div class="flex">
            <span>Aug 21</span>
            <img src="@/assets/images/gray-circle-filled.svg" />
            <span>Status: </span>
            <span>Pending</span>
          </div>
        </div>
        <div class="flex flex-col items-end">
          <span>2 ETH</span>
          <span>2,694 USD</span>
        </div>
      </div>
      <div v-if="isExpanded" class="flex flex-col">
        <hr />
        <div v-if="false">
          <div class="flex flex-col">
            <span>Recepient</span>
            <span>19emj...WA5Cq</span>
          </div>
        </div>
        <div v-else>
          <div class="flex">
            <div class="flex flex-col">
              <span>From</span>
              <span>19emj...WA5Cq</span>
            </div>
            <img src="@/assets/images/arrow-right.svg" />
            <div class="flex flex-col">
              <span>To</span>
              <span>19emj...WA5Cq</span>
            </div>
          </div>
          <div class="flex flex-col">
            <span>Transaction Details</span>
            <div class="flex justify-between">
              <span>Nonce</span>
              <span>5</span>
            </div>
            <div class="flex justify-between">
              <span>Amount</span>
              <span>2 ETH</span>
            </div>
            <div class="flex justify-between">
              <span>Gas Limits (Units)</span>
              <span>0</span>
            </div>
            <div class="flex justify-between">
              <span>Gas Used (Units)</span>
              <span>0</span>
            </div>
            <div class="flex justify-between">
              <span>Gas Price</span>
              <span>0</span>
            </div>
            <div class="flex justify-between">
              <span>Total:</span>
              <span>2 ETH</span>
            </div>
          </div>
        </div>
        <div>
          <a href="#" class="flex">
            View on Explorer <img src="@/assets/images/arrow-up-right.svg" />
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
