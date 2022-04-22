<script setup>
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

app.setAppId(appId)
const authProvider = getAuthProvider(`${appId}`)

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
  <div class="wallet__signin-container">
    <div class="wallet__signin-body">
      <div class="wallet__signin-title-desc">
        <h1 class="wallet__signin-title">Welcome</h1>
        <p class="wallet__signin-desc">
          We’ll email you a magic link for a password-free sign in.
        </p>
      </div>
      <div class="wallet__signin-input-container">
        <label class="wallet__signin-input-label">Email</label>
        <input
          class="wallet__signin-input-field"
          placeholder="someone@example.com"
        />
      </div>
      <button class="wallet_signin-button">Send link</button>
    </div>
    <div class="wallet__signin-footer">
      <OauthLogin @oauth-click="handleOauth" />
      <p class="wallet__signin-signup-text">
        New to Arcana?
        <button class="wallet__signin-signup-cta">Sign Up</button>
      </p>
    </div>
  </div>
</template>

<style scoped>
.wallet__signin-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 20px 15px;
}

.wallet__signin-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
}

.wallet__signin-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 62px;
  margin-top: 60px;
}

.wallet__signin-title-desc {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  height: 76px;
  margin-bottom: 20px;
}

.wallet__signin-title {
  font-size: 20px;
  font-weight: 600;
  text-align: center;
}

.wallet__signin-desc {
  font-size: 14px;
  font-weight: 400;
  text-align: center;
}

.wallet__signin-input-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 30px;
}

.wallet__signin-input-label {
  margin-bottom: 10px;
  margin-left: 15px;
  font-size: 14px;
  font-weight: 400;
}

.wallet__signin-input-field {
  height: 45px;
  padding: 0 16px;
  font-size: 14px;
  font-weight: 400;
  background: var(--debossed-box-color);
  border: none;
  border-radius: 10px;
  box-shadow: var(--debossed-shadow);
}

.wallet__signin-button {
  width: 100%;
  height: 40px;
  font-size: 14px;
  font-weight: 600;
  color: var(--filled-button-fg-color);
  text-transform: uppercase;
  background: var(--filled-button-bg-color);
  border-radius: 10px;
}

.wallet__signin-button:hover {
  transition: all 0.5s;
  transform: scale(1.05, 1.15);
}

.wallet__signin-signup-text {
  font-size: 12px;
  font-weight: 600;
}

.wallet__signin-signup-cta {
  font-size: 12px;
  font-weight: bold;
  color: var(--fg-color);
  text-decoration-line: underline;
  text-transform: uppercase;
}
</style>
