<script setup lang="ts">
const emit = defineEmits(['proceed', 'close'])
</script>

<template>
  <div class="px-1 py-2">
    <div class="flex justify-between">
      <div class="modal-title font-semibold">Enhanced Wallet Security</div>
      <img
        src="@/assets/images/close-icon.svg"
        class="cursor-pointer invert dark:invert-0"
        @click.stop="emit('close')"
      />
    </div>
    <div class="modal-description mt-2 mb-5 flex flex-col gap-4">
      <p>
        Setup answers to security questions in the next step to turn on 2FA. You
        will need to provide the same answers the first time you login on a new
        browser or device.
      </p>
    </div>
    <div>
      <button
        class="text-sm sm:text-xs rounded-xl font-semibold text-white dark:bg-white bg-black dark:text-black w-full h-10 sm:h-8 uppercase"
        @click.stop="emit('proceed')"
      >
        Proceed
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
