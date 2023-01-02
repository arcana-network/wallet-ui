<template>
  <div class="loader"></div>
</template>

<style scoped>
.loader {
  width: 3.2rem;
  height: 3.2rem;
  border: 0.4rem solid black;
  border-right: 0.4rem solid transparent;
  border-radius: 50%;
  transform: translateZ(0);
  animation: loader 750ms infinite linear;
}

.dark .loader {
  border: 0.4rem solid white;
  border-right: 0.4rem solid transparent;
}

@keyframes loader {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
