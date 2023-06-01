<script setup lang="ts">
import type { AuthProvider, GetInfoOutput } from '@arcana/auth-core'
import { SocialLoginType } from '@arcana/auth-core'
import { Core, SecurityQuestionModule } from '@arcana/key-helper'
import type { Connection } from 'penpal'
import { toRefs, onMounted, ref, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { ParentConnectionApi } from '@/models/Connection'
import { useAppStore } from '@/store/app'
import { useUserStore } from '@/store/user'
import { GATEWAY_URL, AUTH_NETWORK } from '@/utils/constants'
import { createParentConnection } from '@/utils/createParentConnection'
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
initStorage()

const {
  params: {
    value: { appId },
  },
} = toRefs(route)

type SocialLogins = Exclude<SocialLoginType, SocialLoginType.passwordless>
let passwordlessLoginHandler: PasswordlessLoginHandler | null

const initPasswordlessLogin = async (email: string) => {
  if (passwordlessLoginHandler) {
    passwordlessLoginHandler.cancel()
  }
  const provider = await getAuthProvider(appId as string)
  const resp = await provider.loginWithOtp(email, {
    withUI: false,
  })
  // if (resp && resp['success']) {

  // } else if (resp && resp['error']) {

  // }

  passwordlessLoginHandler = new PasswordlessLoginHandler(email)
  const params = passwordlessLoginHandler.params()
  passwordlessLoginHandler.start().then(({ privateKey, email, hasMfa, pk }) => {
    storeUserInfoAndRedirect({
      loginType: SocialLoginType.passwordless,
      userInfo: {
        email,
        id: email,
        picture: '',
        name: '',
      },
      privateKey,
      pk,
      hasMfa,
    })
  })
  return params
}
let currentLogin = ''

const initSocialLogin = async (type: SocialLogins): Promise<string> => {
  const val = await authProvider?.loginWithSocial(type)
  if (val) {
    currentLogin = val.state
    return val.url
  }
  throw new Error("Couldn't get login url")
}

const penpalMethods = {
  isLoggedIn: () => user.isLoggedIn,
  initPasswordlessLogin: (email: string) => initPasswordlessLogin(email),
  initSocialLogin: (type: SocialLogins) => initSocialLogin(type),
  isLoginAvailable: (kind: SocialLoginType) =>
    availableLogins.value.includes(kind),
  getPublicKey: handleGetPublicKey,
  getAvailableLogins: () => [...availableLogins.value],
}

const cleanup = () => {
  parentConnection?.destroy()
  window.removeEventListener('message', windowEventHandler)
}

onMounted(init)

onUnmounted(cleanup)

let authProvider: AuthProvider | null = null

async function fetchAvailableLogins(authProvider: AuthProvider) {
  return await authProvider.getAvailableLogins()
}

async function storeUserInfoAndRedirect(
  userInfo: GetInfoOutput & { hasMfa?: boolean; pk?: string }
) {
  const storage = getStorage()
  storage.session.setItem('userInfo', JSON.stringify(userInfo))
  storage.session.setItem('isLoggedIn', JSON.stringify(true))
  user.setUserInfo(userInfo)
  user.setLoginStatus(true)
  if (!userInfo.hasMfa && userInfo.pk) {
    const core = new Core(
      userInfo.pk,
      userInfo.userInfo.id,
      `${appId}`,
      GATEWAY_URL,
      AUTH_NETWORK === 'dev'
    )
    const securityQuestionModule = new SecurityQuestionModule(3)
    securityQuestionModule.init(core)
    const isEnabled = await securityQuestionModule.isEnabled()
    user.hasMfa = isEnabled
  }
  if (userInfo.hasMfa) {
    user.hasMfa = true
    storage.local.setItem(`${user.info.id}-has-mfa`, '1')
  }
  const loginCount = storage.local.getItem(
    `${userInfo.userInfo.id}-login-count`
  )
  const newLoginCount = loginCount ? Number(loginCount) + 1 : 1
  storage.local.setItem(
    `${userInfo.userInfo.id}-login-count`,
    String(newLoginCount)
  )
  router.push({ name: 'home' })
}

const windowEventHandler = (
  ev: MessageEvent<{
    status: string
    messageId: number
    info: GetInfoOutput & { hasMfa?: boolean }
    state?: string
  }>
) => {
  const storage = getStorage()
  console.log({ ev: ev.data })
  // eslint-disable-next-line no-undef
  if (ev.origin !== process.env.VUE_APP_WALLET_DOMAIN) {
    return
  }
  switch (ev.data?.status) {
    case 'LOGIN_INFO': {
      ev.source?.postMessage(
        { status: 'LOGIN_INFO_ACK', messageId: ev.data.messageId },
        { targetOrigin: ev.origin }
      )
      storeUserInfoAndRedirect(ev.data.info)
      if (ev.data.info.hasMfa) {
        user.hasMfa = true
        storage.local.setItem(`${ev.data.info.userInfo.id}-has-mfa`, '1')
      }
      break
    }
    case 'LOGIN_VERIFY': {
      console.log({ currentLogin, state: ev.data?.state })
      ev.source?.postMessage(
        {
          status: 'LOGIN_VERIFY_ACK',
          verified: currentLogin === ev.data?.state,
        }, // maybe send public key here
        { targetOrigin: ev.origin }
      )
      break
    }
    case 'LOGIN_INIT': {
      console.log({ currentLogin, state: ev.data?.state })
      if (ev.data.state) {
        currentLogin = ev.data.state
      }
      ev.source?.postMessage(
        {
          status: 'LOGIN_INIT_ACK',
        }, // maybe send public key here
        { targetOrigin: ev.origin }
      )
      break
    }
  }
}

async function init() {
  isLoading.value = true
  try {
    const storage = getStorage()

    // window listener
    window.addEventListener('message', windowEventHandler)
    app.setAppId(`${appId}`)

    authProvider = await getAuthProvider(`${appId}`)

    availableLogins.value = await fetchAvailableLogins(authProvider)

    const userInfo = JSON.parse(storage.session.getItem('userInfo') || '{}')
    const isLoggedIn = storage.session.getItem('isLoggedIn')

    if (isLoggedIn) {
      const hasMfa = storage.local.getItem(`${userInfo.userInfo.id}-has-mfa`)
      if (!hasMfa && userInfo.pk) {
        const core = new Core(
          userInfo.pk,
          userInfo.userInfo.id,
          `${appId}`,
          GATEWAY_URL,
          AUTH_NETWORK === 'dev'
        )
        const securityQuestionModule = new SecurityQuestionModule(3)
        securityQuestionModule.init(core)
        const isEnabled = await securityQuestionModule.isEnabled()
        user.hasMfa = isEnabled
      }
      user.setUserInfo(userInfo)
      user.setLoginStatus(true)
      user.hasMfa = hasMfa === '1'
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

async function handleGetPublicKey(id, verifier) {
  const authProvider = await getAuthProvider(app.id)
  return await authProvider.getPublicKey({ id, verifier })
}
</script>

<template>
  <div></div>
</template>
