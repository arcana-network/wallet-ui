<script setup lang="ts">
import { useRouter } from 'vue-router'

type Asset = {
  name?: string
  balance: string
  symbol: string
  decimals: number
}

type AssetViewProps = {
  assets: Asset[]
}

const props = defineProps<AssetViewProps>()
const router = useRouter()

function handleAddToken() {
  router.push({ name: 'addToken' })
}

function formatDecimals(balance: string | number, decimals = 0) {
  const divider = Math.pow(10, decimals)
  if (typeof balance !== 'number') {
    balance = Number(balance)
  }
  return balance / divider
}
</script>

<template>
  <div class="flex flex-col">
    <div class="flex justify-between items-center py-[1.25rem]">
      <span class="assets-view__add-token-text">Add a Token</span>
      <button class="h-auto" @click.stop="handleAddToken">
        <img
          class="dark:invert cursor-pointer w-[1.5rem]"
          src="@/assets/images/plus-circle.svg"
          alt="Click to add a token"
        />
      </button>
    </div>
    <hr class="assets-view__separator" />
    <div
      v-for="(asset, index) in props.assets"
      :key="`asset-${index}-${asset.name}`"
      class="flex justify-between items-center py-[1.25rem]"
    >
      <div class="flex items-center gap-3">
        <img src="@/assets/images/plus-circle.svg" class="w-[1.25rem] invert" />
        <span class="assets-view__asset-name">{{ asset.name }}</span>
      </div>
      <div class="assets-view__asset-balance">
        {{ formatDecimals(asset.balance, asset.decimals) }} {{ asset.symbol }}
      </div>
    </div>
  </div>
</template>

<style>
.assets-view__add-token-text,
.assets-view__asset-name,
.assets-view__asset-balance {
  font-size: var(--fs-350);
}

.assets-view__separator {
  border-top: 1px solid var(--color-philippine-gray);
}
</style>
