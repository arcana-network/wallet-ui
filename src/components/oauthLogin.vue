<script setup>
import { SocialLoginType } from '@arcana/auth'

import { useImage } from '@/utils/useImage'

const getImage = useImage()
const emits = defineEmits(['oauthClick'])

const oauthLoginList = [
  {
    value: SocialLoginType.google,
    iconPath: getImage('google-icon'),
  },
  {
    value: SocialLoginType.twitter,
    iconPath: getImage('twitter-icon'),
  },
  {
    value: SocialLoginType.github,
    iconPath: getImage('github-icon'),
  },
]
</script>

<template>
  <div class="wallet__signin-oauth-container">
    <p class="wallet__signin-oauth-text">Or sign in with</p>
    <button
      v-for="oauth in oauthLoginList"
      :key="oauth.value"
      @click="emits('oauthClick', oauth.value)"
    >
      <img class="wallet__signin-oauth-icon" :src="oauth.iconPath" />
    </button>
  </div>
</template>

<style scoped>
.wallet__signin-oauth-container {
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 200px;
}

.wallet__signin-oauth-text {
  font-size: var(--fs-300);
  font-weight: 400;
}

.wallet__signin-oauth-icon {
  width: 24px;
  height: 24px;
}

@media (max-width: 235px) {
  .wallet__signin-oauth-icon {
    width: 20px;
    height: 20px;
  }
}
</style>
