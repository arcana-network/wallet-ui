<script setup lang="ts">
import type { AuthProvider, SocialLoginType } from '@arcana/auth-core'
import type { Connection } from 'penpal'
import { toRefs, onMounted, ref, computed, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import OauthLogin from '@/components/oauthLogin.vue'
import type { ParentConnectionApi } from '@/models/Connection'
import { useAppStore } from '@/store/app'
import { useUserStore } from '@/store/user'
import { createParentConnection } from '@/utils/createParentConnection'
import emailScheme from '@/utils/emailSheme'
import { getAuthProvider } from '@/utils/getAuthProvider'

const route = useRoute()
const router = useRouter()
const user = useUserStore()
const app = useAppStore()
const availableLogins: Ref<SocialLoginType[]> = ref([])
const isLoading: Ref<boolean> = ref(false)
type LoginRequestOrigin = 'parent' | 'wallet'
let parentConnection: Connection<ParentConnectionApi> | null = null

const userEmailInput = ref('')

const disableSendLinkBtn = computed(() => {
  return userEmailInput.value.length === 0
})

const LOGINS_FETCHING_ERROR_TEXT = `No logins configured. If you are the app admin, please configure login
providers on the developer dashboard.`

const {
  params: {
    value: { appId },
  },
} = toRefs(route)

const penpalMethods = {
  isLoggedIn: () => user.isLoggedIn,
  triggerSocialLogin: (type) => handleSocialLoginRequest(type, 'parent'),
  triggerPasswordlessLogin: (email) =>
    handlePasswordlessLoginRequest(email, 'parent'),
  getPublicKey: handleGetPublicKey,
}

onMounted(init)

onUnmounted(() => {
  parentConnection?.destroy()
})

let authProvider: AuthProvider | null = null

async function fetchAvailableLogins(authProvider: AuthProvider) {
  return await authProvider.getAvailableLogins()
}

async function init() {
  isLoading.value = true
  try {
    app.setAppId(`${appId}`)

    authProvider = await getAuthProvider(`${appId}`)

    availableLogins.value = await fetchAvailableLogins(authProvider)

    if (user.isLoggedIn) {
      router.push('/')
    } else {
      parentConnection = createParentConnection({
        ...penpalMethods,
      })

      const parentConnectionInstance = await parentConnection.promise

      const {
        themeConfig: { theme },
        name: appName,
      } = await parentConnectionInstance.getAppConfig()

      localStorage.setItem('theme', theme)
      localStorage.setItem('appName', appName)
      app.setTheme(theme)
      app.setName(appName)

      const parentAppUrl = await parentConnectionInstance.getParentUrl()
      localStorage.setItem('parentAppUrl', parentAppUrl)
    }
  } finally {
    isLoading.value = false
  }
}

async function handleSocialLoginRequest(type, from: LoginRequestOrigin) {
  authProvider.params.autoRedirect = from === 'wallet'
  return await user.handleSocialLogin(authProvider, type)
}

async function handleGetPublicKey(id, verifier) {
  const authProvider = await getAuthProvider(app.id)
  return await authProvider.getPublicKey({ id, verifier })
}

async function handlePasswordlessLoginRequest(email, from: LoginRequestOrigin) {
  const isEmailValid = await emailScheme.isValid(email)
  if (isEmailValid) {
    const authProvider = await getAuthProvider(app.id)
    authProvider.params.autoRedirect = from === 'wallet'
    return await user.handlePasswordlessLogin(authProvider, email, {
      withUI: true,
    })
  }
}

async function onSendLinkClick() {
  handlePasswordlessLoginRequest(userEmailInput.value, 'wallet')
}

function onEnterPress() {
  if (userEmailInput.value.length) onSendLinkClick()
}
</script>

<template>
  <div v-if="isLoading" class="signin__loader">
    <p>Loading...</p>
  </div>
  <div v-else class="signin__container">
    <div class="signin__body flow-container">
      <div class="signin__title-desc flow-element">
        <h1 class="signin__title">Welcome!</h1>
        <p class="signin__desc">
          You will receive a login link in your email for a password-less
          sign-in.
        </p>
      </div>
      <div class="signin__input-container flow-element">
        <label class="signin__input-label">Email</label>
        <input
          v-model="userEmailInput"
          type="email"
          class="signin__input-field"
          placeholder="someone@example.com"
          required
          @keyup.enter="onEnterPress"
        />
      </div>
      <button
        class="signin__button"
        :class="{ 'signin__button--disabled': disableSendLinkBtn }"
        :disabled="disableSendLinkBtn"
        @click="onSendLinkClick"
      >
        Send link
      </button>
    </div>
    <div class="signin__footer">
      <div>
        <OauthLogin
          v-if="availableLogins.length"
          :available-logins="availableLogins"
          @oauth-click="(type) => handleSocialLoginRequest(type, 'wallet')"
        />
        <p v-else class="signin__footer-text-error">
          {{ LOGINS_FETCHING_ERROR_TEXT }}
        </p>
      </div>
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

.signin__loader {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
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
  height: 25px;
}

.signin__footer-text-loading {
  font-size: var(--fs-300);
}

.signin__footer-text-error {
  font-size: var(--fs-250);
  text-align: center;
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

.signin__button--disabled {
  cursor: not-allowed;
  background: var(--button-bg-disabled);
  transform: none;
}

.signin__button--disabled:hover {
  transform: none;
}

@media (max-width: 235px) {
  .signin__container > *:not(:first-child) {
    margin-top: 30px;
  }
}
</style>
