<script setup lang="ts">
const emit = defineEmits(['proceed', 'close'])
</script>

<template>
  <div class="px-1 py-2">
    <div class="flex justify-between">
      <div class="modal-title font-semibold">Export Private Key</div>
      <img
        src="@/assets/images/close-icon.svg"
        class="cursor-pointer invert dark:invert-0"
        @click.stop="emit('close')"
      />
    </div>
    <div class="modal-description mt-2 mb-10 flex flex-col gap-4">
      <p>
        Use this utility to export your private keys to create a backup or to
        use your address with other wallet providers.
      </p>
      <p>
        Please store your keys in a safe place as anyone with access to it can
        take over your wallet.
        <a class="text-blue-500 cursor-pointer">LEARN MORE</a>
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
