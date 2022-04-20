<script setup>
import { useUserStore } from '@/store/user'
import { useImage } from '@/utils/useImage'

const getImage = useImage()
const userStore = useUserStore()
</script>

<template>
  <footer class="footer">
    <div class="footer__poweredby-container">
      <p class="footer__poweredby-text">Powered by</p>
      <a href="https://arcana.network/" target="_blank">
        <img class="footer__poweredby-img" :src="getImage('arcana-logo')" />
      </a>
    </div>
    <router-link
      v-show="userStore.isLoggedIn"
      to="/"
      class="footer__profileicon-link"
    >
      <img :src="getImage('profile-icon')" alt="profile-icon" />
    </router-link>
  </footer>
</template>

<style scoped>
.footer {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.footer__poweredby-container {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
}

.footer__poweredby-container * + * {
  margin-left: 5px;
}

.footer__poweredby-text {
  font-size: 12px;
  font-weight: 400;
}

.footer__poweredby-img {
  width: 60px;
  height: 15px;
}

.footer__profileicon-link {
  position: absolute;
  right: 0;
}
</style>
