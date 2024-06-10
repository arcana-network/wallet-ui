<script setup lang="ts">
import { ref } from 'vue'

import { useModalStore } from '@/store/modal'
import { getImage } from '@/utils/getImage'

const modalContainer = ref(null)

const canModalCollapse = ref(false)
const modalStore = useModalStore()

function handleCollapse() {
  canModalCollapse.value = true
  modalContainer.value.innerHTMl = ''
  setTimeout(() => modalStore.setShowModal(false), 300)
}
</script>

<template>
  <div
    class="fixed flex justify-center items-center inset-0 z-50 p-3 overlay isolate"
  >
    <div
      class="card bg-[#F7F7F7] dark:bg-[#292929] max-h-[90%] absolute flex flex-col pt-2 w-full rounded-b-none z-20"
      :class="{ collapse: canModalCollapse }"
    >
      <div class="flex justify-center">
        <button @click="handleCollapse">
          <img :src="getImage('collapse-arrow.svg')" />
        </button>
      </div>
      <div
        id="modal-container"
        ref="modalContainer"
        class="p-4 overflow-y-auto"
      ></div>
    </div>
    <div class="absolute inset-0 z-10" @click="handleCollapse"></div>
  </div>
</template>

<style scoped>
.overlay {
  background: rgb(18 18 18 / 90%);
}

.card {
  bottom: -100%;
  transition: all 0.3s ease-in-out;
  animation: slide-up 0.3s ease-in-out forwards;
}

.collapse {
  animation: slide-down 0.3s ease-in-out forwards;
}

@keyframes slide-up {
  0% {
    bottom: -100%;
  }

  100% {
    bottom: 0;
  }
}

@keyframes slide-down {
  0% {
    bottom: 0;
  }

  100% {
    bottom: -100%;
  }
}
</style>
