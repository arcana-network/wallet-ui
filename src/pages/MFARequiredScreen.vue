<script setup lang="ts">
import { useRouter } from 'vue-router'

import { useAppStore } from '@/store/app'
import { useUserStore } from '@/store/user'

const appStore = useAppStore()
const user = useUserStore()
const router = useRouter()

function handleProceed() {
  const mfaSetupPath = router.resolve({
    name: 'MFASetup',
    params: { appId: appStore.id },
    query: {
      theme: appStore.theme,
      email: user.info.email,
    },
  })
  window.open(mfaSetupPath.href, '_blank')
}
</script>

<template>
  <div
    class="wallet__card rounded-[10px] w-full max-w-[40rem] mx-auto h-max min-h-max overflow-y-auto p-4"
  >
    <div class="flex gap-2 items-center mb-2">
      <div class="modal-title font-bold">MFA Required</div>
    </div>
    <div class="flex">
      <span style="font-size: var(--fs-350)">
        As the dApp “{{ appStore.name }}” interacts with sensitive information,
        it requires you to have Multi-Factor Authentication enabled. Would you
        like to do so now?
      </span>
    </div>
    <div class="flex mt-4 items-end justify-end">
      <button
        class="text-sm sm:text-xs font-semibold text-black bg-transparent dark:text-white px-2 h-10 sm:h-8 uppercase"
        type="submit"
        @click.stop="handleProceed"
      >
        Proceed
      </button>
    </div>
  </div>
</template>

<style scoped>
label {
  padding-left: 5px;
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

.description {
  font-size: var(--fs-250);
  color: var(--fg-color-secondary);
}
</style>
