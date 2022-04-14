<script setup>
import { useImagesStore } from "@/store/images";
import { useUserStore } from "@/store/user";

const userStore = useUserStore();
const { images } = useImagesStore();
</script>

<template>
  <footer class="footer">
    <div class="footer__poweredby-container">
      <p class="footer__poweredby-text">Powered by</p>
      <a href="https://arcana.network/" target="_blank">
        <img class="footer__poweredby-img" :src="images.arcanaLogo" />
      </a>
    </div>
    <router-link
      to="/"
      class="footer__profileicon-link"
      v-show="userStore.isLoggedIn"
    >
      <img :src="images.profileIcon" alt="profile-icon" />
    </router-link>
  </footer>
</template>

<style scoped>
.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;

  position: relative;
}

.footer__poweredby-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.footer__poweredby-container * + * {
  margin-left: 5px;
}

.footer__poweredby-text {
  font-weight: 400;
  font-size: 12px;
}

.footer__poweredby-img {
  height: 15px;
  width: 60px;
}

.footer__profileicon-link {
  position: absolute;
  right: 0px;
}
</style>
