<script setup lang="ts">
import type { AuthProvider, GetInfoOutput } from '@arcana/auth-core'
import { SocialLoginType, encodeJSON } from '@arcana/auth-core'
import { LoginType } from '@arcana/auth-core/types/types'
import { Core, SecurityQuestionModule } from '@arcana/key-helper'
import type { Connection } from 'penpal'
import type { Ref } from 'vue'
import { onMounted, onUnmounted, ref, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { ParentConnectionApi } from '@/models/Connection'
import { useAppStore } from '@/store/app'
import { useParentConnectionStore } from '@/store/parentConnection'
import { useUserStore } from '@/store/user'
import { AUTH_NETWORK, AUTH_URL, GATEWAY_URL } from '@/utils/constants'
import { createParentConnection } from '@/utils/createParentConnection'
import { getAuthProvider } from '@/utils/getAuthProvider'
import { decodeJSON } from '@/utils/hash'
import {
  getPasswordlessState,
  PasswordlessLoginHandler,
} from '@/utils/PasswordlessLoginHandler'
import { getStorage, initStorage } from '@/utils/storageWrapper'

const route = useRoute()
const router = useRouter()
const user = useUserStore()
const app = useAppStore()
const parentConnectionStore = useParentConnectionStore()
const availableLogins: Ref<SocialLoginType[]> = ref([])
const isLoading: Ref<boolean> = ref(false)
let parentConnection: Connection<ParentConnectionApi> | null = null
initStorage()

enum BearerAuthentication {
  firebase = 'firebase',
}

const {
  params: {
    value: { appId },
  },
  hash,
} = toRefs(route)

type SocialLogins = Exclude<SocialLoginType, SocialLoginType.passwordless>
let passwordlessLoginHandler: PasswordlessLoginHandler | null

const parseHashAndSetSettings = () => {
  if (hash.value) {
    const settings = decodeJSON(hash.value.substring(1))
    if (settings.standaloneMode) {
      app.setStandalone(settings.standaloneMode)
    }
    if (settings.theme) {
      app.setTheme(settings.theme)
    }
    if (settings.position) {
      app.setWalletPosition(settings.position)
    }
  }
}

const LoginState = {
  passwordless: {
    success: false,
    error: '',
  },
  social: '',
}

const initPasswordlessLogin = async (email: string) => {
  if (passwordlessLoginHandler) {
    passwordlessLoginHandler.cancel()
  }
  const provider = await getAuthProvider(appId as string)

  passwordlessLoginHandler = new PasswordlessLoginHandler(email)
  const params = passwordlessLoginHandler.params()
  const state = getPasswordlessState(params.sessionId, params.setToken)
  const response = await provider.loginWithPasswordlessStart({
    email,
    kind: 'link',
    state,
  })
  LoginState.passwordless.success = response.success
  if (!response.success) {
    LoginState.passwordless.error = response.error ?? "Couldn't start login"
    throw new Error(response.error)
  }
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

const initSocialLogin = async (type: SocialLogins): Promise<string> => {
  const val = await authProvider?.loginWithSocial(type)
  if (val) {
    LoginState.social = val.state
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
  triggerBearerLogin: handleBearerLoginRequest,
  getReconnectionUrl: () => {
    const reconURL = new URL(`/v1/reconnect/${app.id}`, AUTH_URL)
    return reconURL.toString()
  },
}

const cleanup = () => {
  parentConnection?.destroy()
  window.removeEventListener('message', windowEventHandler)
}

onMounted(init)

onUnmounted(cleanup)

let authProvider: AuthProvider | null = null

async function fetchAvailableLogins(authProvider: AuthProvider) {
  return (await authProvider.getAvailableLogins()).filter(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    (item) => item !== 'firebase'
  )
}

async function storeUserInfoAndRedirect(
  userInfo: GetInfoOutput & {
    hasMfa?: boolean
    pk?: string
  }
) {
  const storage = getStorage()
  if ((userInfo.loginType as string) === 'firebase' && app.isMfaEnabled) {
    try {
      const core = new Core(
        userInfo.pk as string,
        userInfo.userInfo.id,
        `${appId}`,
        GATEWAY_URL,
        AUTH_NETWORK === 'dev'
      )
      await core.init()
      const key = await core.getKey()
      userInfo.privateKey = key
    } catch (e) {
      storage.session.setUserInfo(userInfo)
      router.push({
        name: 'MFARestore',
        params: { appId: appId as string },
      })
      app.showWallet = true
      app.expandRestoreScreen = true
      return
    }
  }
  storage.session.setUserInfo(userInfo)
  storage.session.setIsLoggedIn()
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
    storage.local.setHasMFA(user.info.id)
  }
  storage.local.incrementLoginCount(userInfo.userInfo.id)
  await router.push({ name: 'home' })
}

const windowEventHandler = (
  ev: MessageEvent<{
    status: string
    messageId: number
    info: GetInfoOutput & { hasMfa?: boolean }
    sessionID: string
    sessionExpiry: number
    state?: string
  }>
) => {
  const storage = getStorage()
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
        storage.local.setHasMFA(ev.data.info.userInfo.id)
      }
      parentConnection?.promise
        .then((ins) => {
          if (ins.setSessionID) {
            return ins.setSessionID(ev.data.sessionID, ev.data.sessionExpiry)
          }
        })
        .catch((e) => {
          console.error('Failed to set session ID!', e)
        })
      break
    }
    case 'LOGIN_VERIFY': {
      ev.source?.postMessage(
        {
          status: 'LOGIN_VERIFY_ACK',
          verified: LoginState.social === ev.data?.state,
        }, // maybe send public key here
        { targetOrigin: ev.origin }
      )
      break
    }
    case 'LOGIN_INIT': {
      if (ev.data.state) {
        LoginState.social = ev.data.state
      }
      ev.source?.postMessage(
        {
          status: 'LOGIN_INIT_ACK',
        }, // maybe send public key here
        { targetOrigin: ev.origin }
      )
      break
    }
    case 'LOGIN_PWDL_INQ': {
      ev.source?.postMessage(
        {
          status: 'LOGIN_PWDL_INQ_RES',
          error: LoginState.passwordless.error,
          success: LoginState.passwordless.success,
        }, // maybe send public key here
        { targetOrigin: ev.origin }
      )
      break
    }
  }
}

async function initializeParentConnection() {
  parentConnection = createParentConnection({
    ...penpalMethods,
  })
  parentConnectionStore.setParentConnection(parentConnection)
  return parentConnection.promise
}

async function init() {
  isLoading.value = true
  try {
    const storage = getStorage()

    parseHashAndSetSettings()

    // window listener
    window.addEventListener('message', windowEventHandler)
    app.setAppId(`${appId}`)

    authProvider = await getAuthProvider(`${appId}`)
    availableLogins.value = await fetchAvailableLogins(authProvider)

    // 3PC is disabled or wallet UI cannot store data by a policy decision
    // if (storage.local.storageType === StorageType.IN_MEMORY) {

    // }

    const userInfo = storage.session.getUserInfo()
    const isLoggedIn = storage.session.getIsLoggedIn()

    if (isLoggedIn && userInfo) {
      const hasMfa = storage.local.getHasMFA(userInfo.userInfo.id)
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
      user.hasMfa = hasMfa
      await router.push({ name: 'home' })
    } else {
      const parentConnectionInstance = await initializeParentConnection()
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

async function handleGetPublicKey(id: string, verifier: LoginType) {
  const authProvider = await getAuthProvider(app.id)
  return await authProvider.getPublicKey({ id, verifier })
}

async function handleBearerLoginRequest(
  type: BearerAuthentication,
  _data: unknown
) {
  // Intentionally doing this to get the KeyReconstructor out of Auth SDK (which we shouldn't expose to external users)
  // but would be OK to use internally
  const ap = await getAuthProvider(app.id)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  await ap.initKeyReconstructor()
  const kr = // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ap.keyReconstructor

  switch (type) {
    case BearerAuthentication.firebase: {
      const data = _data as {
        uid: string
        token: string
      }

      const info = await kr.getPrivateKey({
        verifier: BearerAuthentication.firebase,
        id: data.uid,
        idToken: data.token,
      })

      // TODO
      const userInfo = {
        loginType: 'firebase',
        hasMfa: false,
        privateKey: info.privateKey as string,
        pk: info.privateKey as string,
        userInfo: {
          id: data.uid,
        },
      }
      await storeUserInfoAndRedirect(userInfo)

      return true
    }
    default:
      return false
  }
}
</script>

<template>
  <div></div>
</template>
