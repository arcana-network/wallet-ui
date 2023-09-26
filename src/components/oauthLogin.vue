<script setup lang="ts">
import { SocialLoginType } from '@jrstudio/auth-core-legacy'

import { useImage } from '@/utils/useImage'

const getImage = useImage()

interface Props {
  availableLogins: SocialLoginType[]
}

const props = defineProps<Props>()

const oauthLoginList = props.availableLogins
  .filter((login) => login !== 'passwordless')
  .map((login) => ({
    value: SocialLoginType[login],
    iconPath: getImage(`${login}-icon`),
  }))

const emits = defineEmits(['oauthClick'])
</script>

<template>
  <div class="wallet__signin-oauth-container">
    <p class="wallet__signin-oauth-text">Or sign in with</p>
    <div class="flex gap-2">
      <button
        v-for="oauth in oauthLoginList"
        :key="oauth.value"
        @click="emits('oauthClick', oauth.value)"
      ></button>
    </div>
  </div>
</template>

<style scoped>
.wallet__signin-oauth-container {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.wallet__signin-oauth-container > * + * {
  margin-left: 10px;
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
