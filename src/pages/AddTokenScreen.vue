<script setup lang="ts">
import { useRouter } from 'vue-router'

import contractMap from '@/contract-map.json'

const router = useRouter()
const tokens = Object.keys(contractMap).map((address) => ({
  ...contractMap[address],
  contractAddress: address,
}))

function handleCancel() {
  router.back()
}
</script>

<template>
  <div class="wallet__body mb-[2.5rem]">
    <div class="p-4 sm:p-2 h-full flex flex-col overflow-auto">
      <h2 class="font-semibold mb-5 add-token__title">Add a Token</h2>
      <form class="flex flex-col" @submit.prevent="void 0">
        <div class="flex flex-col gap-1">
          <label for="search-token" class="text-sm font-semibold label"
            >Search Token</label
          >
          <div class="flex p-4 input gap-1 justify-center">
            <img src="@/assets/images/search-icon.svg" />
            <input
              id="search-token"
              type="search"
              list="available-tokens"
              placeholder="Enter Token Symbol"
              class="text-base bg-transparent outline-none"
            />
            <img src="@/assets/images/arrow-gray.svg" />
          </div>
        </div>
        <datalist
          id="available-tokens"
          class="absolute h-40 bg-black text-white"
        >
          <option
            v-for="token in tokens"
            :key="token.address"
            :value="token.symbol"
            class="bg-black text-white"
          ></option>
        </datalist>
        <div class="text-center my-6">Add Custom Token</div>
        <div class="flex flex-col gap-5">
          <div class="flex flex-col gap-1">
            <label for="token-name" class="text-sm font-semibold label"
              >Token Name</label
            >
            <input
              id="token-name"
              type="text"
              placeholder="Eg. Arcana"
              class="text-base p-4 input"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label for="token-symbol" class="text-sm font-semibold label"
              >Token Symbol</label
            >
            <input
              id="token-symbol"
              type="text"
              placeholder="Eg. XAR"
              class="text-base p-4 input"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label
              for="token-contract-address"
              class="text-sm font-semibold label"
              >Token Contract Address</label
            >
            <input
              id="token-contract-address"
              type="text"
              placeholder="Eg. 0x000000000000"
              class="text-base p-4 input"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label for="token-decimal" class="text-sm font-semibold label"
              >Token Decimal</label
            >
            <input
              id="token-decimal"
              type="number"
              placeholder="0"
              class="text-base p-4 input"
              min="0"
              step="1"
            />
          </div>
          <div class="flex space-x-3">
            <button
              type="reset"
              class="text-sm sm:text-xs rounded-xl text-black border-white border-2 dark:text-white dark:border-white flex-1 font-semibold uppercase"
              @click.stop="handleCancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="text-sm sm:text-xs rounded-xl text-white dark:bg-white bg-black dark:text-black flex-1 font-semibold uppercase"
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.add-token__title {
  font-size: var(--fs-500);
}

.label,
::placeholder {
  color: var(--color-philippine-gray);
}

.input {
  background: linear-gradient(141.48deg, #161616 -4.56%, #151515 135.63%);
  border-radius: 10px;
  box-shadow: inset -2px -2px 4px rgb(57 57 57 / 44%),
    inset 5px 5px 10px rgb(11 11 11 / 50%);
}

#search-token::-webkit-calendar-picker-indicator,
#search-token::-webkit-list-button {
  display: none !important;
}

#search-token::-webkit-search-cancel-button {
  display: none;
}
</style>
