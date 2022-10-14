<script setup>
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/antd.css'

const emits = defineEmits(['selectGasPrice'])

const props = defineProps({
  disable: {
    type: Boolean,
    required: true,
  },
})

const marksData = {
  0: 'Slow',
  1: 'Average',
  2: 'Fast',
  3: 'Fastest',
}

const markStyle = {
  width: '6px',
  height: '6px',
  backgroundColor: '#000',
  transform: 'translate(-2px, -2px)',
  cursor: 'pointer',
}

const railStyle = {
  height: '1px',
}

const dotStyle = {
  border: 'none',
  boxShadow: '0 0 0 2px #fff',
}

const processStyle = {
  backgroundColor: '#fff',
}

const stepActiveStyle = {
  backgroundColor: '#000',
  boxShadow: '0 0 0 2px #fff',
}

const labelStyle = {
  color: '#fff',
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
        class="w-4 h-4 bg-white rounded-full border-none shadow-white"
      ></div>
      <div
        v-else
        class="bg-transparent h-full"
        @click="() => handleSlide(0)"
      ></div>
    </template>
  </vue-slider>
</template>
