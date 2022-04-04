<script setup>
import { useImagesStore } from "@/store/images";
const { images } = useImagesStore();
</script>

<template>
  <footer class="wallet_footer">
    <p>Powered by Arcana</p>
    <img :src="images.profileIcon" alt="profile-icon" />
  </footer>
</template>

<style scoped>
.wallet_footer {
  font-weight: 400;
  font-size: 12px;

  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
