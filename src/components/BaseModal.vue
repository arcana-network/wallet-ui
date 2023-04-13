<template>
  <div
    class="backdrop-blur-sm fixed flex justify-center items-center inset-0 z-50 p-3 overlay"
  >
    <div
      id="modal-container"
      class="container p-3 sm:p-2 w-full max-w-[40rem] rounded-lg overflow-auto max-h-full"
    ></div>
  </div>
</template>

<style scoped>
.overlay {
  background: rgb(18 18 18 / 90%);
}

.container {
  background: var(--card-bg);
  box-shadow: var(--card-shadow);
}
</style>
