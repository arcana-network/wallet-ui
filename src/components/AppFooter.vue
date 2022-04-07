<script setup>
import { useImagesStore } from "@/store/images";
import { useUserStore } from "@/store/user";
import { toRefs } from "vue";

const { isLoggedIn } = toRefs(useUserStore());
const { images } = useImagesStore();
</script>

<template>
  <footer class="wallet_footer">
    <p>Powered by Arcana</p>
    <router-link to="/" v-show="isLoggedIn">
      <img :src="images.profileIcon" alt="profile-icon" />
    </router-link>
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
