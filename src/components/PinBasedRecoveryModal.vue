<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'vue-toastification'

const emit = defineEmits(['proceed', 'back', 'switch-alternate'])

const password = ref('')
const passwordType = ref('password')
const toast = useToast()

function handleProceed() {
  if (!password.value) return toast.error('Enter the pin to continue')
  emit('proceed', {
    password: password.value,
  })
}
</script>

<template>
  <div class="px-8 py-2">
    <div class="flex gap-2 items-center mb-5">
      <button @click.stop="emit('back')">
        <img
          src="@/assets/images/arrow-white.svg"
          class="-rotate-90 invert dark:invert-0"
        />
      </button>
      <div class="modal-title font-semibold">Recovery PIN</div>
    </div>
    <form class="flex flex-col gap-4" @submit.prevent="handleProceed">
      <div class="flex flex-col gap-1">
        <label>Type in the PIN used during setup</label>
        <div class="relative">
          <input
            v-model.trim="password"
            :type="passwordType"
            class="text-base p-4 input text-ellipsis overflow-hidden whitespace-nowrap w-full"
            placeholder="Enter a alphanumberic pin"
          />
          <img
            v-if="passwordType === 'password'"
            src="@/assets/images/show-eye.png"
            class="absolute top-0 right-0 p-[0.5rem] cursor-pointer invert dark:invert-0"
            title="Show password"
            @click.stop="passwordType = 'text'"
          />
          <img
            v-else
            src="@/assets/images/hide-eye.png"
            class="absolute top-0 right-0 p-[0.5rem] cursor-pointer invert dark:invert-0"
            title="Hide password"
            @click.stop="passwordType = 'password'"
          />
        </div>
      </div>
      <button
        class="mt-1 text-sm sm:text-xs rounded-xl font-semibold text-white dark:bg-white bg-black dark:text-black w-full h-10 sm:h-8 uppercase"
        type="submit"
      >
        Proceed
      </button>
      <button
        class="font-semibold capitalize text-sm sm:text-xs"
        @click.stop="emit('switch-alternate')"
      >
        Answer Security Questions Instead
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
