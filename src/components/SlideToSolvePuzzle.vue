<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

import { getImage } from '@/utils/getImage'

const translateUntil = ref('0')
const isIntersecting = ref(false)
const isDragging = ref(false)
const swiperEl = ref<HTMLButtonElement | null>(null)
const puzzlePieceSource = ref<HTMLImageElement | null>(null)
const puzzlePieceDestination = ref<HTMLImageElement | null>(null)
const emit = defineEmits(['solved'])
const puzzleText = ref('Slide to solve the puzzle')
const isPuzzleRefreshing = ref(false)
const isSwiperFocused = ref(false)

onMounted(() => {
  const destination = puzzlePieceDestination.value
  if (destination) {
    destination.style.transform = `translateX(-${getRandomDestinationPlacement()})`
  }
  document.body.onmouseup = (e) => {
    handleDragEnd()
  }
  document.body.ontouchend = (e) => {
    handleDragEnd()
  }
  document.body.ontouchcancel = (e) => {
    handleDragEnd()
  }
})

onBeforeUnmount(() => {
  document.body.onmouseup = null
  document.body.ontouchend = null
  document.body.ontouchcancel = null
})

function getRandomDestinationPlacement() {
  const randomPlacement = Math.floor(Math.random() * 80)
  return `${randomPlacement}px`
}

function checkIntersection() {
  const source = puzzlePieceSource.value
  const destination = puzzlePieceDestination.value
  if (source && destination) {
    const sourceRect = source.getBoundingClientRect()
    const destinationRect = destination.getBoundingClientRect()
    return (
      sourceRect.right >= destinationRect.right - 1 &&
      sourceRect.right <= destinationRect.right + 1
    )
  }
  return false
}

function handleDrag(e) {
  const swiper = swiperEl.value
  if (isDragging.value && swiper && swiper.parentElement) {
    let clientX
    if (e.type === 'touchmove') {
      clientX = e.touches[0].layerX
    } else {
      clientX = e.layerX
    }
    clientX = clientX - swiper.clientWidth / 2
    if (clientX >= swiper.parentElement.clientWidth - swiper.clientWidth) {
      clientX = swiper.parentElement.clientWidth - swiper.clientWidth
    } else if (clientX <= swiper.clientWidth / 2) {
      clientX = 0
    }
    translateUntil.value = `${clientX}px`
    isIntersecting.value = checkIntersection()
  }
}

function handleDragEnd() {
  if (isSwiperFocused.value) {
    isDragging.value = false
    if (isIntersecting.value) {
      const swiper = swiperEl.value
      if (swiper) {
        swiper.style.transform = ''
      }
      puzzleText.value = 'Puzzle Solved'
      emit('solved')
    } else {
      translateUntil.value = '0'
      isPuzzleRefreshing.value = true
      const destination = puzzlePieceDestination.value
      if (destination) {
        destination.style.transform = `translateX(-${getRandomDestinationPlacement()})`
      }
      setTimeout(() => {
        isPuzzleRefreshing.value = false
      }, 1000)
    }
    isSwiperFocused.value = false
  }
}

function handleDragStart(e) {
  isSwiperFocused.value = true
  const swiper = swiperEl.value
  if (
    swiper &&
    e.clientX <= swiper.getBoundingClientRect().right &&
    e.clientX >= swiper.getBoundingClientRect().left
  ) {
    isDragging.value = true
  }
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div
      class="h-[80px] w-[264px] rounded-md mx-auto p-4 overflow-hidden bg-black-100"
    >
      <div class="relative flex items-center h-full w-full isolate">
        <img
          ref="puzzlePieceSource"
          src="@/assets/images/puzzle-piece-1.svg"
          class="h-10 w-10 absolute left-0 transition duration-150 z-[100]"
          :style="{
            transform: `translateX(${translateUntil})`,
          }"
        />
        <img
          ref="puzzlePieceDestination"
          src="@/assets/images/puzzle-piece-1-outline.svg"
          class="absolute h-10 w-10 right-0 transition z-[10] transition duration-150"
          :class="{
            'drop-shadow-glow': isIntersecting,
          }"
        />
        <div
          v-if="isPuzzleRefreshing"
          class="absolute inset-0 bg-black-100 z-[1000] flex flex-col gap-1 items-center justify-center"
        >
          <img
            src="@/assets/images/dark/refresh.svg"
            class="w-5 h-5 animate-spin"
          />
          <span class="text-gray-100 text-[12px]">Refreshing...</span>
        </div>
      </div>
    </div>
    <div
      class="h-10 w-full card w-[250px] mx-auto rounded-[5px] p-[3px] bg-white-100 dark:bg-black-100 border border-solid broder-gray-100 overflow-hidden"
    >
      <div
        class="relative rounded-[2px] w-full h-8 overflow-hidden"
        @touchstart="handleDragStart"
        @touchend="handleDragEnd"
        @mousedown="handleDragStart"
        @mouseup="handleDragEnd"
        @mousemove="handleDrag"
        @touchmove="handleDrag"
        @touchcancel="handleDragEnd"
      >
        <button
          ref="swiperEl"
          class="relative btn-primary w-[40px] h-full rounded-[2px] z-10 transition duration-150 flex justify-center items-center"
          :style="{
            transform: `translateX(${translateUntil})`,
          }"
        >
          <div
            v-if="!isIntersecting"
            class="relative flex items-center justify-center w-[20%] select-none"
          >
            <img
              :src="getImage('slider-right.svg')"
              class="select-none animate-1"
            />
            <img
              :src="getImage('slider-right.svg')"
              class="select-none animate-2"
            />
            <img
              :src="getImage('slider-right.svg')"
              class="select-none animate-3"
            />
          </div>
          <img
            v-else
            src="@/assets/images/check-mark.svg"
            class="w-5 h-5 select-none"
          />
          <div class="absolute z-[100] inset-0 w-full h-full"></div>
        </button>
        <div class="absolute z-[1] flex inset-0 items-center justify-center">
          <span class="text-gray-100 text-[12px] select-none">{{
            puzzleText
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-1,
.animate-2,
.animate-3 {
  opacity: 0.1;
  animation: fade 1.2s infinite;
}

.animate-2 {
  animation-delay: 0.15s;
}

.animate-3 {
  animation-delay: 0.3s;
}

@keyframes fade {
  0% {
    opacity: 0.1;
  }

  40% {
    opacity: 1;
  }

  80% {
    opacity: 0.1;
  }
}
</style>
