<template>
  <div class="flex flex-col">
    <div class="flex justify-between items-center py-[1.25rem]">
      <span class="assets-view__add-token-text">Add a Token</span>
      <img
        class="dark:invert cursor-pointer w-[1.5rem]"
        src="@/assets/images/plus-circle.svg"
        alt="Click to add a token"
      />
    </div>
    <hr class="assets-view__separator" />
    <div class="flex justify-between items-center py-[1.25rem]">
      <div class="flex items-center gap-3">
        <img src="@/assets/images/plus-circle.svg" class="w-[1.25rem]" />
        <span class="assets-view__asset-name">Ethereum</span>
      </div>
      <div class="assets-view__asset-balance">3.6 ETH</div>
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
