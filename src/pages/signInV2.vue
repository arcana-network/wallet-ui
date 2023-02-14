<script setup lang="ts">
import type { AuthProvider, GetInfoOutput } from '@arcana/auth-core'
import { SocialLoginType } from '@arcana/auth-core'
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
import { PasswordlessLoginHandler } from '@/utils/PasswordlessLoginHandler'
import { getStorage, initStorage } from '@/utils/storageWrapper'

const route = useRoute()
const router = useRouter()
const user = useUserStore()
const app = useAppStore()
const availableLogins: Ref<SocialLoginType[]> = ref([])
const isLoading: Ref<boolean> = ref(false)
let parentConnection: Connection<ParentConnectionApi> | null = null
let channel: BroadcastChannel | null = null
initStorage()
const storage = getStorage()

const userEmailInput = ref('')
const passwordlessForm = ref(null)
const isEmailFocused = ref(false)

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

let passwordlessLoginHandler: PasswordlessLoginHandler | null

const initPasswordlessLogin = (email: string) => {
  if (passwordlessLoginHandler) {
    passwordlessLoginHandler.cancel()
  }
  passwordlessLoginHandler = new PasswordlessLoginHandler(email)
  const params = passwordlessLoginHandler.params()
  passwordlessLoginHandler.start().then(({ privateKey, email }) => {
    storeUserInfoAndRedirect({
      loginType: SocialLoginType.passwordless,
      userInfo: {
        email,
        id: email,
        picture: '',
        name: '',
      },
      privateKey,
    })
  })
  return params
}

const penpalMethods = {
  isLoggedIn: () => user.isLoggedIn,
  initPasswordlessLogin: (email: string) => initPasswordlessLogin(email),
  isLoginAvailable: (kind: SocialLoginType) =>
    availableLogins.value.includes(kind),
  getPublicKey: handleGetPublicKey,
  getAvailableLogins: () => [...availableLogins.value],
}

const cleanup = () => {
  parentConnection?.destroy()
  if (channel) {
    channel.close()
  }
  window.removeEventListener('message', windowEventHandler)
}

onMounted(init)

onUnmounted(cleanup)

let authProvider: AuthProvider | null = null

async function fetchAvailableLogins(authProvider: AuthProvider) {
  return await authProvider.getAvailableLogins()
}

function storeUserInfoAndRedirect(userInfo: GetInfoOutput) {
  console.log('storeAndUserInfo.', storage)
  storage.session.setItem('userInfo', JSON.stringify(userInfo))
  storage.session.setItem('isLoggedIn', JSON.stringify(true))
  user.setUserInfo(userInfo)
  user.setLoginStatus(true)
  router.push({ name: 'home' })
}

const channelEventHandler = (ev: MessageEvent) => {
  if (ev.data?.status === 'LOGIN_INFO') {
    channel?.postMessage({
      status: 'LOGIN_INFO_ACK',
      messageId: ev.data.messageId,
    })
    storeUserInfoAndRedirect(ev.data.info)
  }
}

const windowEventHandler = (
  ev: MessageEvent<{ status: string; messageId: number; info: GetInfoOutput }>
) => {
  // eslint-disable-next-line no-undef
  if (ev.origin !== process.env.VUE_APP_WALLET_DOMAIN) {
    return
  }
  if (ev.data?.status === 'LOGIN_INFO') {
    ev.source?.postMessage(
      { status: 'LOGIN_INFO_ACK', messageId: ev.data.messageId },
      { targetOrigin: ev.origin }
    )
    storeUserInfoAndRedirect(ev.data.info)
  }
}

async function init() {
  isLoading.value = true
  try {
    // channel listener
    channel = new BroadcastChannel(`${appId}_login_notification`)
    channel.addEventListener('message', channelEventHandler)

    // window listener
    window.addEventListener('message', windowEventHandler)
    app.setAppId(`${appId}`)

    authProvider = await getAuthProvider(`${appId}`)

    availableLogins.value = await fetchAvailableLogins(authProvider)

    const userInfo = JSON.parse(storage.session.getItem('userInfo') || '{}')
    const isLoggedIn = storage.session.getItem('isLoggedIn')

    if (isLoggedIn) {
      user.setUserInfo(userInfo)
      user.setLoginStatus(true)
      router.push({ name: 'home' })
    } else {
      parentConnection = createParentConnection({
        ...penpalMethods,
      })

      const parentConnectionInstance = await parentConnection.promise

      const {
        themeConfig: { theme },
        name: appName,
      } = await parentConnectionInstance.getAppConfig()

      app.setTheme(theme)
      const htmlEl = document.getElementsByTagName('html')[0]
      if (theme === 'dark') htmlEl.classList.add(theme)
      app.setName(appName)
    }
  } finally {
    isLoading.value = false
  }
}

async function handleSocialLoginRequest(kind: SocialLoginType) {
  const c = await parentConnection?.promise
  c?.triggerSocialLogin(kind)
}

async function handleGetPublicKey(id, verifier) {
  const authProvider = await getAuthProvider(app.id)
  return await authProvider.getPublicKey({ id, verifier })
}

async function handlePasswordlessLoginRequest(email: string) {
  const isEmailValid = await emailScheme.isValid(email)
  if (isEmailValid) {
    const c = await parentConnection?.promise
    c?.triggerPasswordlessLogin(email)
    return
  }
}

async function handleSubmit() {
  handlePasswordlessLoginRequest(userEmailInput.value)
}

function onEnterPress() {
  if (passwordlessForm.value.email.checkValidity()) handleSubmit()
}
</script>

<template>
  <div v-if="isLoading" class="signin__loader flex-1">
    <p>Loading...</p>
  </div>
  <div v-else class="flex items-center">
    <div class="wallet__card rounded-[10px] flex flex-col mb-[10px]">
      <div class="signin__container">
        <div class="signin__body flow-container">
          <div class="signin__title-desc flow-element">
            <h1 class="signin__title">Welcome!</h1>
            <p class="signin__desc">
              You will receive a login link in your email for a password-less
              sign-in.
            </p>
          </div>
          <form
            ref="passwordlessForm"
            class="signin__input-container flow-element"
            @submit.prevent="handleSubmit"
          >
            <label class="signin__input-label">Email</label>
            <input
              v-model="userEmailInput"
              name="email"
              type="email"
              class="signin__input-field py-4"
              placeholder="someone@example.com"
              required
              :class="{
                'outline-black dark:outline-white outline-1 outline':
                  isEmailFocused,
              }"
              @keyup.enter="onEnterPress"
              @focus="isEmailFocused = true"
              @blur="isEmailFocused = false"
            />
            <input
              type="submit"
              value="Send Link"
              class="signin__button"
              :class="{ 'signin__button--disabled': disableSendLinkBtn }"
              :disabled="disableSendLinkBtn"
            />
          </form>
        </div>
        <div class="signin__footer">
          <div>
            <OauthLogin
              v-if="availableLogins.length"
              :available-logins="availableLogins"
              @oauth-click="(type) => handleSocialLoginRequest(type)"
            />
            <p v-else class="signin__footer-text-error">
              {{ LOGINS_FETCHING_ERROR_TEXT }}
            </p>
          </div>
        </div>
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
  margin-top: 40px;
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
  flex: 1;
  flex-direction: column;
  width: 100%;
}

.signin__input-label {
  margin-left: 15px;
  font-size: var(--fs-300);
  font-weight: 400;
}

.signin__input-field {
  padding: var(--p-400);
  font-size: var(--fs-350);
  font-weight: 400;
  color: var(--fg-color);
  background: var(--debossed-box-color);
  border: none;
  border-radius: 10px;
  box-shadow: var(--debossed-shadow);
}

.signin__button {
  width: 100%;
  height: 2.25rem;
  font-size: var(--fs-350);
  font-weight: 600;
  color: var(--filled-button-fg-color);
  text-transform: uppercase;
  background: var(--filled-button-bg-color);
  border: none;
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

  .signin__button {
    height: 1.75rem;
  }
}
</style>
