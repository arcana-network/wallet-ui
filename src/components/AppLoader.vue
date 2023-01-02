<script setup lang="ts">
import SpinningLoader from '@/components/SpinningLoader.vue'

type LoaderProps = {
  message: string
}

const props = defineProps<LoaderProps>()
</script>

<template>
  <div class="flex flex-col gap-4 justify-center items-center">
    <SpinningLoader />
    <p class="text-base sm:text-xs">{{ props.message }}</p>
  </div>
</template>
