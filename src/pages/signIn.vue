<script setup lang="ts">
import { toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import OauthLogin from '@/components/oauthLogin.vue'
import { useAppStore } from '@/store/app'
import { useUserStore } from '@/store/user'
import { getAuthProvider } from '@/utils/getAuthProvider'

const route = useRoute()
const router = useRouter()
const user = useUserStore()
const app = useAppStore()

const {
  params: {
    value: { appId },
  },
} = toRefs(route)

app.setAppId(`${appId}`)
const authProvider = getAuthProvider(appId)

async function handleOauth(type) {
  try {
    await user.handleLogin(authProvider, type)
    router.push('/')
  } catch (error) {
    user.$reset() // resets user store if login fails
  }
}
</script>

<template>
  <div class="signin__container">
    <div class="signin__body flow-container">
      <div class="signin__title-desc flow-element">
        <h1 class="signin__title">Welcome</h1>
        <p class="signin__desc">
          We’ll email you a magic link for a password-free sign in.
        </p>
      </div>
      <div class="signin__input-container flow-element">
        <label class="signin__input-label">Email</label>
        <input class="signin__input-field" placeholder="someone@example.com" />
      </div>
      <button class="signin__button">Send link</button>
    </div>
    <div class="signin__footer">
      <OauthLogin @oauth-click="handleOauth" />
    </div>
  </div>
</template>

<style scoped>
.signin__container {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  padding: var(--p-500) var(--p-400);
}

.signin__container > *:not(:first-child) {
  margin-top: 80px;
}

.signin__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
}

.signin__footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.signin__title-desc {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.signin__title {
  font-size: var(--fs-500);
  font-weight: 600;
  text-align: center;
}

.signin__desc {
  font-size: var(--fs-350);
  font-weight: 400;
  text-align: center;
}

.signin__input-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.signin__input-label {
  margin-left: 15px;
  font-size: var(--fs-300);
  font-weight: 400;
}

.signin__input-field {
  height: 45px;
  padding: 0 var(--p-400);
  font-size: var(--fs-350);
  font-weight: 400;
  color: var(--fg-color);
  background: var(--debossed-box-color);
  border: none;
  border-radius: 10px;
  outline: none;
  box-shadow: var(--debossed-shadow);
}

.signin__button {
  width: 100%;
  font-size: var(--fs-350);
  font-weight: 600;
  color: var(--filled-button-fg-color);
  text-transform: uppercase;
  background: var(--filled-button-bg-color);
  border-radius: 10px;
}

.signin__button:hover {
  transition: all 0.5s;
  transform: scale(1.05, 1.15);
}

@media (max-width: 235px) {
  .signin__container > *:not(:first-child) {
    margin-top: 30px;
  }
}
</style>
