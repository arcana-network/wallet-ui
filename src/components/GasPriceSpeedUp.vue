<script setup lang="ts">
import { type Ref, ref, watch } from 'vue'

const selectedSpeedPercentLabel: Ref<'faster' | 'fastest'> = ref('faster')
const speedupPercent = ref(10)

watch(selectedSpeedPercentLabel, (newVal) => {
  if (newVal === 'faster') {
    speedupPercent.value = 10
  } else if (newVal === 'fastest') {
    speedupPercent.value = 25
  }
})

const emits = defineEmits(['close', 'proceed'])
</script>

<template>
  <div class="flex flex-col space-y-2 relative">
    <div class="flex justify-center">
      <h3 class="text-lg font-medium">Speed Up</h3>
    </div>
    <div class="flex justify-between items-baseline">
      <span class="text-sm font-normal text-[#8D8D8D]">Gas Fees</span>
    </div>
    <div class="card flex p-1">
      <div
        class="p-1 w-full text-center text-base font-normal cursor-pointer rounded-sm hover:bg-black-500 dark:hover:bg-black-300 focus-visible:bg-black-500 dark:focus-visible:bg-black-300 select-none"
        :class="{
          'bg-black-500 dark:bg-black-300 text-white-100':
            selectedSpeedPercentLabel === 'faster',
          'text-gray-100': selectedSpeedPercentLabel !== 'faster',
        }"
        @click.stop="selectedSpeedPercentLabel = 'faster'"
      >
        Faster - 10%
      </div>
      <div
        class="p-1 w-full text-center text-base font-normal cursor-pointer rounded-sm hover:bg-black-500 dark:hover:bg-black-300 focus-visible:bg-black-500 dark:focus-visible:bg-black-300 select-none"
        :class="{
          'bg-black-500 dark:bg-black-300 text-white-100':
            selectedSpeedPercentLabel === 'fastest',
          'text-gray-100': selectedSpeedPercentLabel !== 'fastest',
        }"
        @click.stop="selectedSpeedPercentLabel = 'fastest'"
      >
        Fastest - 25%
      </div>
    </div>
    <div class="flex justify-center space-x-2">
      <button
        class="btn-secondary font-bold text-sm w-2/3 py-1"
        @click="emits('close')"
      >
        Cancel
      </button>
      <button
        class="btn-primary font-bold text-sm w-2/3 py-1"
        @click="emits('proceed', speedupPercent)"
      >
        Proceed
      </button>
    </div>
  </div>
</template>
