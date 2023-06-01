<script setup lang="ts">
import { ref, type Ref } from 'vue'

import { getImage } from '@/utils/getImage'

type SwipeToActionProps = {
  message?: string
}
const props = defineProps<SwipeToActionProps>()
const emit = defineEmits(['success'])
const translateUntil = ref('calc(-80%)')
const isDragging = ref(false)
const swiperEl: Ref<HTMLDivElement | null> = ref(null)

function handleDrag(e) {
  if (isDragging.value) {
    const swiperX = swiperEl.value?.getBoundingClientRect().x
    const swiperContainer =
      swiperEl.value?.parentElement?.getBoundingClientRect()
    if (
      (swiperContainer && e.clientX >= swiperContainer.right) ||
      (swiperX && swiperContainer && swiperX >= swiperContainer.x)
    ) {
      translateUntil.value = 'calc(0%)'
      emit('success')
      return
    }
    let clientX
    if (e.type === 'touchmove') {
      clientX = e.touches[0].clientX
    } else {
      clientX = e.clientX
    }
    translateUntil.value = `calc(-100% + ${clientX}px)`
  }
}

function handleDragEnd() {
  const swiperX = swiperEl.value?.getBoundingClientRect().x
  const swiperContainerX =
    swiperEl.value?.parentElement?.getBoundingClientRect().x
  if (swiperX && swiperContainerX && swiperX < swiperContainerX - 60) {
    translateUntil.value = 'calc(-80%)'
  } else {
    translateUntil.value = 'calc(0%)'
    emit('success')
  }
  isDragging.value = false
}

function handleDragStart(e) {
  if (
    swiperEl.value &&
    e.clientX <= swiperEl.value.getBoundingClientRect().right
  ) {
    isDragging.value = true
  }
}
</script>

<template>
  <div class="bg-white-400 dark:bg-gray-300 rounded-sm p-[2px]">
    <div
      class="relative rounded-sm overflow-hidden"
      @touchstart="handleDragStart"
      @touchend="handleDragEnd"
      @mousedown="handleDragStart"
      @mouseup="handleDragEnd"
      @mousemove="handleDrag"
      @touchmove="handleDrag"
    >
      <div
        class="flex items-center justify-center text-xs font-normal text-gray-100 p-[10px] select-none"
      >
        {{ props.message || 'Swipe to Continue' }}
      </div>
      <div
        ref="swiperEl"
        class="absolute btn-primary inset-0 z-10 cursor-pointer transition-all duration-300 ease-in-out flex justify-end"
        :style="{ transform: `translateX(${translateUntil})` }"
      >
        <div class="flex items-center justify-center w-[20%] select-none">
          <img
            :src="getImage('slider-right.svg')"
            class="opacity-0 animate-1 select-none"
          />
          <img
            :src="getImage('slider-right.svg')"
            class="opacity-0 animate-2 select-none"
          />
          <img
            :src="getImage('slider-right.svg')"
            class="opacity-0 animate-3 select-none"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-1 {
  animation: animate-1 2.4s infinite linear 1.7s;
}

.animate-2 {
  animation: animate-2 2.4s infinite linear 0.9s;
}

.animate-3 {
  animation: animate-3 2.4s infinite linear 0.1s;
}

@keyframes animate-1 {
  0% {
    opacity: 1;
    transform: translate(0);
  }

  90% {
    opacity: 0;
    transform: translate(200%);
  }

  95% {
    opacity: 0;
    transform: translate(0);
  }

  100% {
    opacity: 1;
    transform: translate(0);
  }
}

@keyframes animate-2 {
  0% {
    opacity: 1;
    transform: translate(-100%);
  }

  90% {
    opacity: 0;
    transform: translate(100%);
  }

  95% {
    opacity: 0;
    transform: translate(-100%);
  }

  100% {
    opacity: 1;
    transform: translate(-100%);
  }
}

@keyframes animate-3 {
  0% {
    opacity: 1;
    transform: translate(-200%);
  }

  90% {
    opacity: 0;
    transform: translate(0);
  }

  95% {
    opacity: 0;
    transform: translate(-200%);
  }

  100% {
    opacity: 1;
    transform: translate(-200%);
  }
}
</style>
