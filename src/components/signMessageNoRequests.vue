<script setup>
import { useImage } from "@/utils/useImage";

const getImage = useImage();
</script>

<template>
  <div class="no-requests_container">
    <img :src="getImage('green-tick')" alt="Tick Icon" class="no-requests_img" />
    <p class="no-requests_text">No Pending Requests!</p>
  </div>
</template>

<style scoped>
.no-requests_container {
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  height: 100%;
}

.no-requests_img {
  height: 40px;
  width: 40px;
  margin: 0 auto;

  margin-bottom: 20px;
}

.no-requests_text {
  font-weight: 600;
  font-size: 20px;
  text-align: center;
}
</style>
