<script setup lang="ts">
import { useUserStore } from '@/store/user'
import { useImage } from '@/utils/useImage'

const getImage = useImage()
const userStore = useUserStore()
</script>

<template>
  <footer
    class="footer"
    :class="{ 'footer--space-between': userStore.isLoggedIn }"
  >
    <div class="footer__poweredby-container">
      <p class="footer__poweredby-text">Powered by</p>
      <a href="https://arcana.network/" target="_blank">
        <img class="footer__poweredby-img" :src="getImage('arcana-logo')" />
      </a>
    </div>
    <router-link
      v-if="userStore.isLoggedIn"
      to="/"
      class="footer__profileicon-link"
    >
      <img
        :src="getImage('profile-icon')"
        alt="profile-icon"
        class="footer__profileicon-img"
      />
    </router-link>
  </footer>
</template>

<style scoped>
.footer {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20px;
}

.footer__poweredby-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer__poweredby-container * + * {
  margin-left: 5px;
}

.footer__poweredby-text {
  font-size: var(--fs-300);
  font-weight: 400;
}

.footer__poweredby-img {
  width: 60px;
  height: 15px;
}

.footer__profileicon-img {
  width: 20px;
  height: 20px;
}

.footer--space-between {
  justify-content: space-between;
}
</style>
