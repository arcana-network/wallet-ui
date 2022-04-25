<script setup lang="ts">
import { useImage } from '@/utils/useImage'

const getImage = useImage()
</script>

<template>
  <div class="no-requests__container">
    <img
      :src="getImage('green-tick')"
      alt="Tick Icon"
      class="no-requests__img"
    />
    <p class="no-requests__text">No Pending Requests!</p>
  </div>
</template>

<style scoped>
.no-requests__container {
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  height: 100%;
  background-color: var(--container-bg-color);
  box-shadow: none;
}

.no-requests__img {
  width: 40px;
  height: 40px;
  margin: 0 auto;
  margin-bottom: 20px;
}

.no-requests__text {
  font-size: var(--fs-500);
  font-weight: 600;
  text-align: center;
}
</style>
