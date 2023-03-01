<script setup lang="ts">
import { Theme } from '@arcana/auth'
import { useHeadSafe } from 'unhead'
import { useRoute } from 'vue-router'

const route = useRoute()
const theme = route.query.theme as Theme
document.documentElement.classList.add(theme)
useHeadSafe({
  title: 'Setup Multifactor Authentication | Arcana Wallet',
})
</script>

<template>
  <div
    class="wallet__card rounded-[10px] w-full max-w-[40rem] mx-auto h-max min-h-max"
  >
    <h2 class="font-semibold mb-5 title uppercase m-8">Security Questions</h2>
    <hr />
    <form class="flex flex-col p-8 gap-4" @submit.prevent="void 0">
      <div class="flex flex-col gap-1">
        <label>Question 1</label>
        <input
          class="text-base p-4 input text-ellipsis overflow-hidden whitespace-nowrap"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label>Answer 1</label>
        <input
          class="text-base p-4 input text-ellipsis overflow-hidden whitespace-nowrap"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label>Question 2</label>
        <input
          class="text-base p-4 input text-ellipsis overflow-hidden whitespace-nowrap"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label>Answer 2</label>
        <input
          class="text-base p-4 input text-ellipsis overflow-hidden whitespace-nowrap"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label>Question 3</label>
        <input
          class="text-base p-4 input text-ellipsis overflow-hidden whitespace-nowrap"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label>Answer 3</label>
        <input
          class="text-base p-4 input text-ellipsis overflow-hidden whitespace-nowrap"
        />
      </div>
      <div class="flex justify-end gap-2 mt-12">
        <button
          class="text-sm sm:text-xs rounded-xl text-black border-black border-2 dark:text-white dark:border-white w-full max-w-[144px] font-semibold uppercase"
        >
          Cancel
        </button>
        <button
          class="text-sm sm:text-xs rounded-xl text-white dark:bg-white bg-black dark:text-black w-full max-w-[144px] font-semibold uppercase"
        >
          Save
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
label {
  font-size: var(--fs-300);
  font-weight: 600;
  color: var(--fg-color-secondary);
}

hr {
  border-top: 1px solid #8d8d8d20;
}

.title {
  font-size: var(--fs-500);
}
</style>
