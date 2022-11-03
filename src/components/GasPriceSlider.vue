<script setup lang="ts">
import VueSlider from 'vue-slider-component'

import { useAppStore } from '@/store/app'
import 'vue-slider-component/theme/antd.css'

const emits = defineEmits(['selectGasPrice'])

const props = defineProps({
  disable: {
    type: Boolean,
    required: true,
  },
})

const appStore = useAppStore()

const hasDarkMode = appStore.theme === 'dark'

const marksData = {
  0: 'Slow',
  1: 'Standard',
  2: 'Fast',
}

const markStyle = {
  width: '6px',
  height: '6px',
  backgroundColor: hasDarkMode ? '#000' : '#fff',
  transform: 'translate(-2px, -3px)',
  cursor: 'pointer',
}

const railStyle = {
  height: '1px',
  backgroundColor: '#8d8d8d',
}

const dotStyle = {
  border: 'none',
  boxShadow: hasDarkMode ? '0 0 0 2px #fff' : '0 0 0 2px #000',
}

const processStyle = {
  backgroundColor: hasDarkMode ? '#fff' : '#000',
}

const stepActiveStyle = {
  backgroundColor: hasDarkMode ? '#000' : '#fff',
  boxShadow: hasDarkMode ? '0 0 0 2px #fff' : '0 0 0 2px #000',
}

const labelStyle = {
  color: hasDarkMode ? '#fff' : '#000',
  marginTop: '15px',
}

function marks(value) {
  return {
    label: marksData[value],
    style: markStyle,
    labelStyle,
  }
}

function handleSlide(value) {
  const type = marksData[value]
  emits('selectGasPrice', type)
}

handleSlide(0)
</script>

<template>
  <vue-slider
    :data="marksData"
    :marks="marks"
    :rail-style="railStyle"
    :dot-style="dotStyle"
    :process-style="processStyle"
    :step-active-style="stepActiveStyle"
    tooltip="none"
    @change="handleSlide"
  >
    <template #dot>
      <div
        v-if="!props.disable"
        class="w-4 h-4 -m-[1px] bg-black dark:bg-white rounded-full border-none shadow-black dark:shadow-white"
      ></div>
    </template>
  </vue-slider>
</template>
