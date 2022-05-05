<script setup lang="ts">
import { SocialLoginType as SocialLogins } from '@arcana/auth'
import type { SocialLoginType } from '@arcana/auth'

import { useImage } from '@/utils/useImage'

const getImage = useImage()

interface Props {
  availableLogins: SocialLoginType[]
}

const props = defineProps<Props>()

const oauthLoginList = props.availableLogins.map((login) => ({
  value: SocialLogins[login],
  iconPath: getImage(`${login}-icon`),
}))

const emits = defineEmits(['oauthClick'])
</script>

<template>
  <div class="wallet__signin-oauth-container">
    <p class="wallet__signin-oauth-text">Or sign in with</p>
    <div class="wallet__signin-oauth-icons-container">
      <button
        v-for="oauth in oauthLoginList"
        :key="oauth.value"
        @click="emits('oauthClick', oauth.value)"
      >
        <img class="wallet__signin-oauth-icon" :src="oauth.iconPath" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.wallet__signin-oauth-container {
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 200px;
}

.wallet__signin-oauth-container > * + * {
  margin-left: 10px;
}

.wallet__signin-oauth-text {
  font-size: var(--fs-300);
  font-weight: 400;
}

.wallet__signin-oauth-icons-container {
  flex: 1;
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
