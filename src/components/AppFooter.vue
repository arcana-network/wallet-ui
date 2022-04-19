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
