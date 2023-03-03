<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import SecurityQuestionRecoveryModal from '@/components/SecurityQuestionRecoveryModal.vue'
import TextBasedRecoveryModal from '@/components/TextBasedRecoveryModal.vue'
import { useAppStore } from '@/store/app'
import { useModalStore } from '@/store/modal'
import { useUserStore } from '@/store/user'

const appStore = useAppStore()
const user = useUserStore()
const router = useRouter()
const modalStore = useModalStore()
const recoveryMethod = ref('')

function handleProceed(val: 'text-based' | 'question-based') {
  modalStore.setShowModal(true)
  recoveryMethod.value = val
}

function handleBack() {
  modalStore.setShowModal(false)
  recoveryMethod.value = ''
}
</script>

<template>
  <div
    class="wallet__card rounded-[10px] w-full max-w-[40rem] mx-auto h-max min-h-max overflow-y-auto p-4"
  >
    <div class="flex gap-2 items-center mb-2">
      <div class="modal-title font-bold">Keyshare not found</div>
    </div>
    <div class="flex" style="font-size: var(--fs-350)">
      Changing devices or clearing your browser data can remove access to your
      key share. Answer the security questions you set up, or provide the
      encrypted text and encryption PIN in order to recover your key share.
    </div>
    <div class="flex mt-4 items-end justify-center gap-4">
      <button
        class="text-sm sm:text-xs font-semibold text-black bg-transparent dark:text-white h-10 sm:h-8 uppercase"
        type="submit"
        @click.stop="handleProceed('text-based')"
      >
        Provide Pin
      </button>
      <button
        class="text-sm sm:text-xs font-semibold text-black bg-transparent dark:text-white h-10 sm:h-8 uppercase"
        type="submit"
        @click.stop="handleProceed('question-based')"
      >
        Answer Questions
      </button>
    </div>
    <Teleport v-if="modalStore.show" to="#modal-container">
      <SecurityQuestionRecoveryModal
        v-if="recoveryMethod === 'question-based'"
        @back="handleBack"
        @proceed="void 0"
      />
      <TextBasedRecoveryModal
        v-if="recoveryMethod === 'text-based'"
        @back="handleBack"
        @proceed="void 0"
      />
    </Teleport>
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
