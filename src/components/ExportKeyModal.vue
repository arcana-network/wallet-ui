<script setup lang="ts">
import { ref } from 'vue'

import { getImage } from '@/utils/getImage'

type ExportKeyModalProps = {
  privateKey: string
}

const props = defineProps<ExportKeyModalProps>()

const showPK = ref(false)

const emit = defineEmits(['copy', 'download', 'close'])
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex justify-center">
      <div class="font-bold text-lg">Export Private Key</div>
    </div>
    <div class="flex flex-col gap-1">
      <div class="flex items-center justify-between">
        <label class="font-bold text-sm">Private Key</label>
        <button
          class="btn-tertiary flex gap-1 items-center"
          @click="showPK = !showPK"
        >
          <img
            :src="getImage(showPK ? 'eye-off.svg' : 'eye.svg')"
            class="w-xs h-xs"
          />
          <span class="font-bold text-sm">{{ showPK ? 'Hide' : 'Show' }}</span>
        </button>
      </div>
      <div class="relative">
        <div
          class="relative text-gray-100 card p-4 break-words font-normal text-base z-0"
        >
          {{ props.privateKey }}
        </div>
        <div
          class="absolute inset-0 rounded-sm transition-all duration-200 z-10"
          :class="showPK ? '' : 'glass-effect'"
        ></div>
      </div>
    </div>
    <div class="flex gap-8 justify-center">
      <button
        class="flex gap-1 items-center justify-center btn-tertiary text-sm font-medium p-2"
        @click.stop="emit('copy')"
      >
        <img :src="getImage('copy.svg')" class="w-lg h-lg" />
        <span>Copy</span>
      </button>
      <button
        class="flex gap-1 items-center justify-center btn-tertiary text-sm font-medium p-2"
        @click.stop="emit('download')"
      >
        <img :src="getImage('download.svg')" class="w-lg h-lg" />
        <span>Download</span>
      </button>
    </div>
  </div>
</template>
