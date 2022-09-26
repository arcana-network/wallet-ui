<script setup lang="ts">
type Asset = {
  name: string
  balance: number
  currency: string
}

type AssetViewProps = {
  assets: Asset[]
}

const props = defineProps<AssetViewProps>()
</script>

<template>
  <div class="flex flex-col px-4">
    <div class="flex justify-end py-4 gap-1 items-center">
      <img
        class="dark:invert cursor-pointer w-6"
        src="@/assets/images/plus-circle.svg"
        alt="Click to add a token"
      />
      <span class="assets-view__add-token-text">Token</span>
    </div>
    <hr class="assets-view__separator" />
    <div
      v-for="(asset, index) in props.assets"
      :key="`asset-${index}-${asset.name}`"
      class="flex justify-between items-center py-5"
    >
      <div class="flex items-center gap-3">
        <img src="@/assets/images/plus-circle.svg" class="w-5" />
        <span class="assets-view__asset-name">{{ asset.name }}</span>
      </div>
      <div class="assets-view__asset-balance">
        {{ asset.balance }} {{ asset.currency }}
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
