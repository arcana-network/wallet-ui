<template>
  <div
    class="modal__container flex justify-center items-center absolute h-screen w-screen top-0 left-0 z-50 p-4"
  >
    <slot />
  </div>
</template>

<style scoped>
.modal__container {
  backdrop-filter: blur(32px);
}
</style>
