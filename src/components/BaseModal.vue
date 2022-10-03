<template>
  <div
    class="backdrop-blur-[32px] fixed flex justify-center items-center inset-0 z-50 p-2"
  >
    <div
      id="modal-container"
      class="container h-full min-w-full p-3 sm:p-2 rounded-lg overflow-auto"
    ></div>
  </div>
</template>

<style scoped>
.container {
  background: var(--content-bg-color);
  box-shadow: 4px 5px 4px rgb(0 0 0 / 25%);
}
</style>
