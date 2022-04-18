<script setup>
import { SocialLoginType } from "@arcana/auth";
import { getImage } from "@/utils/getImage";

const emits = defineEmits(["oauthClick"]);

const oauthLoginList = [
  {
    value: SocialLoginType.google,
    iconPath: getImage("google-icon"),
  },
  {
    value: SocialLoginType.twitter,
    iconPath: getImage("twitter-icon"),
  },
  {
    value: SocialLoginType.github,
    iconPath: getImage("github-icon"),
  },
];
</script>

<template>
  <div class="wallet_signin-oauth-container">
    <p class="wallet_signin-oauth-text">Or sign in with</p>
    <button
      v-for="oauth in oauthLoginList"
      :key="oauth.value"
      @click="emits('oauthClick', oauth.value)"
    >
      <img class="wallet_signin-oauth-icon" :src="oauth.iconPath" />
    </button>
  </div>
</template>

<style scoped>
.wallet_signin-oauth-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 200px;
}

.wallet_signin-oauth-text {
  font-size: 10px;
  font-weight: 400;
}

.wallet_signin-oauth-icon {
  width: 24px;
  height: 24px;
}
</style>
