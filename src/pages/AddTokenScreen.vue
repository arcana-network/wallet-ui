<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function handleCancel() {
  router.back()
}
</script>

<template>
  <div class="wallet__body mb-[2.5rem]">
    <div
      class="p-4 sm:p-2 h-full flex flex-col space-y-5 sm:space-y-3 overflow-auto"
    >
      <h2 class="font-semibold mb-5 add-token__title">Add a Token</h2>
      <form class="flex flex-col" @submit.prevent="void 0">
        <div class="">
          <label>Search Token</label>
          <input type="search" />
        </div>
        <div class="">Add Custom Token</div>
        <div class="">
          <label>Token Name</label>
          <input type="text" />
        </div>
        <div class="">
          <label>Token Symbol</label>
          <input type="text" />
        </div>
        <div class="">
          <label>Token Contract Address</label>
          <input type="text" />
        </div>
        <div class="">
          <label>Token Decimal</label>
          <input type="number" />
        </div>
        <div class="">
          <button type="reset" @click.stop="handleCancel">Cancel</button>
          <button type="submit">Save</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.add-token__title {
  font-size: var(--fs-500);
}
</style>
