<script setup lang="ts">
import { DOCS_URL } from '@/utils/constants'

const emit = defineEmits(['proceed', 'close'])
</script>

<template>
  <div class="px-1 py-2 flex flex-col gap-4">
    <div class="flex justify-center">
      <div class="font-medium text-lg">Enhance Wallet Security</div>
    </div>
    <div class="text-sm text-gray-100 flex flex-col gap-2">
      <p>
        Turn on MFA by setting up security questions and a PIN. You will need to
        enter either of them to authenticate when you login to a new device or
        browser.
        <br />
        <a
          :href="`${DOCS_URL}/concepts/mfa.html`"
          target="_blank"
          class="font-medium text-black-500 dark:text-white-100 cursor-pointer"
          >LEARN MORE</a
        >
      </p>
    </div>
    <div>
      <button
        class="uppercase text-sm font-medium p-2 btn-primary flex justify-center items-center w-full"
        @click.stop="emit('proceed')"
      >
        Proceed
      </button>
    </div>
  </div>
</template>
