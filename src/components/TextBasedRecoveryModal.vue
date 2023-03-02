<script setup lang="ts">
const emit = defineEmits(['proceed', 'back'])
</script>

<template>
  <div class="px-1 py-2">
    <div class="flex gap-2 items-center mb-5">
      <button @click.stop="emit('back')">
        <img
          src="@/assets/images/arrow-white.svg"
          class="-rotate-90 invert dark:invert-0"
        />
      </button>
      <div class="modal-title font-semibold">Text Based Recovery</div>
    </div>
    <form class="flex flex-col gap-4" @submit.prevent="emit('proceed')">
      <div class="flex flex-col gap-1">
        <label>Encrypted Text</label>
        <textarea
          rows="3"
          class="text-base p-4 input resize-none"
          placeholder="Encrypted text"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label>Pin used for encryption</label>
        <input
          class="text-base p-4 input text-ellipsis overflow-hidden whitespace-nowrap"
          placeholder="Enter a alphanumberic pin"
        />
      </div>
      <button
        class="mt-1 text-sm sm:text-xs rounded-xl font-semibold text-white dark:bg-white bg-black dark:text-black w-full h-10 sm:h-8 uppercase"
        type="submit"
      >
        Proceed
      </button>
    </form>
  </div>
</template>

<style scoped>
.modal-title {
  font-size: var(--fs-500);
}

.modal-description {
  font-size: var(--fs-250);
  color: var(--fg-color-secondary);
}

label {
  padding-left: 5px;
  font-size: var(--fs-300);
  font-weight: 600;
  color: var(--fg-color-secondary);
}
</style>
