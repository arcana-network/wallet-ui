<script setup lang="ts">
import { getIconAsset } from '@/utils/useImage'
</script>

<template>
  <div
    class="no-requests__container flex-1 flex flex-col content-center justify-center h-full"
  >
    <img
      :src="getIconAsset('no-pending-requests.svg')"
      alt="Tick Icon"
      class="w-20 h-20 mx-auto mb-5"
    />
    <p class="no-requests__text font-semibold text-center">
      No Pending Requests!
    </p>
  </div>
</template>

<style scoped>
.no-requests__container {
  background-color: var(--container-bg-color);
  box-shadow: none;
}

.no-requests__text {
  font-size: var(--fs-500);
}
</style>
