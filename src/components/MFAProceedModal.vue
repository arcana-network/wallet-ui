<script setup lang="ts">
import { DOCS_URL } from '@/utils/constants'

const emit = defineEmits(['proceed', 'close'])
</script>

<template>
  <div class="px-1 py-2">
    <div class="flex justify-between">
      <div class="modal-title font-semibold">Enhance Wallet Security</div>
      <img
        src="@/assets/images/close-icon.svg"
        class="cursor-pointer invert dark:invert-0"
        @click.stop="emit('close')"
      />
    </div>
    <div class="modal-description mt-2 mb-5 flex flex-col gap-4">
      <p>
        Turn on 2FA by setting up security questions and a PIN. You will need to
        enter either of them to authenticate when you login to a new device or
        browser.
        <a
          :href="`${DOCS_URL}/concepts/mfa.html`"
          target="_blank"
          class="text-blue-500 font-semibold cursor-pointer"
          >LEARN MORE</a
        >
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
