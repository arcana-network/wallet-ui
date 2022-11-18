<script setup lang="ts">
type ExportKeyModalProps = {
  privateKey: string
}

const props = defineProps<ExportKeyModalProps>()

const emit = defineEmits(['copy', 'download', 'close'])
</script>

<template>
  <div class="px-1 py-2">
    <div>
      <div class="modal-title font-semibold">Export Private Key</div>
    </div>
    <div class="my-5 flex flex-col gap-1">
      <label class="modal-form-label">Private Key</label>
      <div class="debossed-card rounded-[10px] p-4 break-words">
        {{ props.privateKey }}
      </div>
    </div>
    <div class="flex gap-10 justify-center">
      <button class="flex gap-1" @click.stop="emit('copy')">
        <img src="@/assets/images/copy.svg" class="invert dark:invert-0" />
        <span>Copy</span>
      </button>
      <button class="flex gap-1" @click.stop="emit('download')">
        <img src="@/assets/images/download.svg" class="invert dark:invert-0" />
        <span>Download</span>
      </button>
    </div>
    <div class="mt-10">
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

.modal-form-label {
  font-size: var(--fs-300);
  font-weight: 600;
  color: var(--fg-color-secondary);
}
</style>
