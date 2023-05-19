<script setup lang="ts">
type ExportKeyModalProps = {
  privateKey: string
}

const props = defineProps<ExportKeyModalProps>()

const emit = defineEmits(['copy', 'download', 'close'])
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex justify-center">
      <div class="font-bold text-lg">Export Private Key</div>
    </div>
    <div class="flex flex-col gap-1">
      <label class="font-normal text-gray-100 text-sm">Private Key</label>
      <div class="relative z-0">
        <div class="relative card p-4 break-words font-normal text-base z-0">
          {{ props.privateKey }}
        </div>
      </div>
    </div>
    <div class="flex gap-5 justify-center">
      <button
        class="flex gap-1 items-center justify-center btn-secondary w-full text-sm font-medium p-2"
        @click.stop="emit('copy')"
      >
        <img src="@/assets/images/copy.svg" class="w-lg h-lg" />
        <span>Copy</span>
      </button>
      <button
        class="flex gap-1 items-center justify-center btn-secondary w-full text-sm font-medium p-2"
        @click.stop="emit('download')"
      >
        <img src="@/assets/images/download.svg" class="w-lg h-lg" />
        <span>Download</span>
      </button>
    </div>
  </div>
</template>
