<script setup lang="ts">
const emit = defineEmits(['close'])
</script>

<template>
  <div class="px-1 py-4">
    <div class="flex flex-col items-center gap-8">
      <img src="@/assets/images/success.svg" />
      <div class="modal-title font-semibold">Verified</div>
    </div>
    <div class="modal-description mt-2 mb-10 flex flex-col gap-4">
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur
        tellus nisi, pellentesque id vulputate sed, luctus
      </p>
    </div>
    <div>
      <button
        class="text-sm sm:text-xs rounded-xl font-semibold text-white dark:bg-white bg-black dark:text-black w-full h-10 sm:h-8 uppercase"
        @click.stop="emit('close')"
      >
        Done
      </button>
    </div>
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
</style>
