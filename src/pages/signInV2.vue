<script setup lang="ts">
import type { AuthProvider, GetInfoOutput } from '@arcana/auth-core'
import { SocialLoginType } from '@arcana/auth-core'
import { LoginType } from '@arcana/auth-core/types/types'
import { Core, SecurityQuestionModule } from '@arcana/key-helper'
import type { Connection } from 'penpal'
import type { Ref } from 'vue'
import { onBeforeMount, onMounted, onUnmounted, ref, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { ParentConnectionApi } from '@/models/Connection'
import { useAppStore } from '@/store/app'
import { useConfigStore } from '@/store/config'
import { useParentConnectionStore } from '@/store/parentConnection'
import { useUserStore } from '@/store/user'
import { ChainType } from '@/utils/chainType'
import { AUTH_NETWORK, AUTH_URL, GATEWAY_URL } from '@/utils/constants'
import { createParentConnection } from '@/utils/createParentConnection'
import { devLogger } from '@/utils/devLogger'
import { getAuthProvider } from '@/utils/getAuthProvider'
import { decodeJSON } from '@/utils/hash'
import { getUserDIDToken } from '@/utils/loginToken'
import { getMnemonicInShard } from '@/utils/multiversx/shard'
import {
  getPasswordlessState,
  PasswordlessLoginHandler,
} from '@/utils/PasswordlessLoginHandler'
import {
  getStorage,
  initStorage,
  initSensitiveStorage,
  getSensitiveStorage,
} from '@/utils/storageWrapper'

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

let config

onBeforeMount(async () => {
  devLogger.log('signinv2::onBeforeMount')
})

onMounted(async () => {
  devLogger.log('signinv2::onMounted')
  isLoading.value = true

  config = await useConfigStore(appId as string)
  try {
    initSensitiveStorage(
      config.session_persisted,
      config.session_max_age,
      appId as string
    )
    const storage = getStorage()
    const sensitiveStorage = getSensitiveStorage()
    parseHashAndSetSettings()

    // window listener
    window.addEventListener('message', windowEventHandler)
    app.setAppId(`${appId}`)

    authProvider = await getAuthProvider(`${appId}`)
    let userInfo = sensitiveStorage.getUserInfo()
    devLogger.log('signinv2', { userInfo })

    if (!userInfo) {
      try {
        const data = await requestLoginFromOtherTab(appId as string)
        sensitiveStorage.setUserInfo(data)
        userInfo = sensitiveStorage.getUserInfo()
      } catch (e) {
        //Ignore error
      }
    }
    if (userInfo?.userInfo) {
      const hasMfa = storage.local.getHasMFA(userInfo.userInfo.id)
      user.hasMfa = hasMfa
      if (!hasMfa && userInfo.pk) {
        const core = new Core({
          dkgKey: userInfo.pk,
          userId: userInfo.userInfo.id,
          appId: `${appId}`,
          gatewayUrl: GATEWAY_URL,
          debug: AUTH_NETWORK === 'dev',
          curve: app.curve,
        })
        const securityQuestionModule = new SecurityQuestionModule(3)
        securityQuestionModule.init(core)
        const isEnabled = await securityQuestionModule.isEnabled()
        user.hasMfa = isEnabled
      }
      user.setUserInfo(userInfo)
      user.setLoginStatus(true)
      await router.push({ name: 'home' })
    } else {
      availableLogins.value = await fetchAvailableLogins(authProvider)
      const parentConnectionInstance = await initializeParentConnection()
      if (route.query.logout && route.query.logout == '1') {
        await parentConnectionInstance.onEvent('disconnect')
      }
      const {
        themeConfig: { theme },
        name: appName,
      } = await parentConnectionInstance.getAppConfig()
      app.setTheme(theme)
      const htmlEl = document.getElementsByTagName('html')[0]
      if (theme === 'dark') htmlEl.classList.add('dark')
      app.setName(appName)
    }
  } finally {
    isLoading.value = false
  }
})

onUnmounted(() => {
  parentConnection?.destroy()
  window.removeEventListener('message', windowEventHandler)
})

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

let OTPLoginParams = {
  email: '',
}

const initOTPLogin = async (email: string) => {
  const provider = await getAuthProvider(appId as string)
  const response = await provider.loginWithPasswordlessV2Start({
    email,
    kind: 'otp',
  })
  if (response && (response as { url: string }).url) {
    devLogger.log('initOTPLogin: in response.url', { response })
    return (response as { url: string }).url
  }
  OTPLoginParams.email = email
  devLogger.log('initOTPLogin: after response.url', {
    response,
    OTPLoginParams,
  })
}

const completeOTPLogin = async (otp: string) => {
  const provider = await getAuthProvider(appId as string)
  if (provider.appConfig.global) {
    throw new Error('not available')
  }

  await provider.loginWithPasswordlessV2Complete({
    otp,
    email: OTPLoginParams.email,
  })

  const userInfo: GetInfoOutput & { pk: string; hasMfa?: boolean } = {
    ...provider.getUserInfo(),
    pk: provider.getUserInfo().privateKey,
  }
  userInfo.pk = userInfo.privateKey
  storeUserInfoAndRedirect(userInfo, true)
}

const LoginState = {
  passwordless: {
    success: false,
    error: '',
  },
  social: '',
}

const initPasswordlessLogin = async (email: string) => {
  const provider = await getAuthProvider(appId as string)
  if (provider.appConfig.global) {
    const response = await provider.loginWithPasswordlessStart({
      email,
      kind: 'otp',
    })
    if ((response as { url: string }).url) {
      return (response as { url: string }).url
    }
  }
  if (passwordlessLoginHandler) {
    passwordlessLoginHandler.cancel()
  }

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
  passwordlessLoginHandler
    .start()
    .then(({ token, privateKey, email, hasMfa, pk }) => {
      storeUserInfoAndRedirect({
        loginType: SocialLoginType.passwordless,
        userInfo: {
          email,
          id: email,
          picture: '',
          name: '',
        },
        token,
        privateKey,
        pk,
        hasMfa,
      })
    })
  return params
}

const requestLoginFromOtherTab = async (appID: string) => {
  const bc = new BroadcastChannel(`${appID}_login_helper`)
  const responsePromise = promiseWithTimeout(
    new Promise((resolve) => {
      bc.onmessage = (e) => {
        if (e.data.method === 'LOGIN_HELP_RESPONSE') {
          const response = e.data.response_data
          return resolve(response)
        }
      }
    }),
    1000
  )
  bc.postMessage({ method: 'LOGIN_HELP' })
  const data = await responsePromise
  bc.close()
  return data
}

const promiseWithTimeout = (prom, time) => {
  let timer
  return Promise.race([
    prom,
    new Promise((_r, rej) => (timer = setTimeout(rej, time))),
  ]).finally(() => clearTimeout(timer))
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
  initOTPLogin: (email: string) => initOTPLogin(email),
  completeOTPLogin: (otp: string) => completeOTPLogin(otp),
  initSocialLogin: (type: SocialLogins) => initSocialLogin(type),
  isLoginAvailable: (kind: SocialLoginType) =>
    availableLogins.value.includes(kind),
  getPublicKey: async (id: string, verifier: LoginType) => {
    const authProvider = await getAuthProvider(app.id)
    return await authProvider.getPublicKey({ id, verifier })
  },
  getAvailableLogins: () => [...availableLogins.value],
  triggerBearerLogin: handleBearerLoginRequest,
  triggerCustomLogin: handleCustomLoginRequest,
  getReconnectionUrl: () => {
    const reconURL = new URL(`/v1/reconnect/${app.id}`, AUTH_URL)
    return reconURL.toString()
  },
  getKeySpaceConfigType: () => (config.global ? 'global' : 'local'),
}

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
    pk: string
    userDIDToken?: string
  },
  addMFA = false
) {
  const storage = getStorage()
  storage.local.setCurve(app.curve)
  if (app.isMfaEnabled) {
    storage.session.setInAppLogin(addMFA)
  }
  if (addMFA && app.isMfaEnabled) {
    try {
      const core = new Core({
        dkgKey: userInfo.pk as string,
        userId: userInfo.userInfo.id,
        appId: `${appId}`,
        gatewayUrl: GATEWAY_URL,
        debug: AUTH_NETWORK === 'dev',
        curve: app.curve,
      })
      const isNewUser = await core.init()
      if (isNewUser && app.chainType === ChainType.multiversx_cv25519) {
        const shardID = parseInt(authProvider?.appConfig.chain_settings?.shards)
        devLogger.log({
          shardFromAPI: shardID,
          config: authProvider?.appConfig,
        })
        const mn = getMnemonicInShard(shardID)
        const key = mn.deriveKey().hex()
        await core.importKey(key)
        userInfo.privateKey = key
        const mnemonic = mn.toString()
        storage.session.setMnemonic(mnemonic)
      } else {
        userInfo.privateKey = await core.getKey()
      }
      const key = await core.getKey()
      userInfo.privateKey = key
    } catch (e) {
      if (e instanceof Error) {
        if (e.message === 'LOCAL_SHARE_MISSING') {
          storage.session.setUserInfo(userInfo)
          router.push({
            name: 'MFARestore',
            params: { appId: appId as string },
            query: { inApp: '1' },
          })
          const parent = await parentConnection?.promise
          parent?.onEvent('message', 'mfa_flow')
          app.showWallet = true
          app.expandRestoreScreen = true
          return
        }
      }
    }
  }

  userInfo.userDIDToken = await getUserDIDToken({
    privateKey: userInfo.privateKey,
    curve: app.curve,
    userID: userInfo.userInfo.id,
    appID: appId as string,
  })

  // storage.session.setUserInfo(userInfo)
  getSensitiveStorage().setUserInfo(userInfo)
  storage.session.setIsLoggedIn()
  user.setUserInfo(userInfo)
  user.setLoginStatus(true)
  if (!userInfo.hasMfa && userInfo.pk) {
    const core = new Core({
      dkgKey: userInfo.pk,
      userId: userInfo.userInfo.id,
      appId: `${appId}`,
      gatewayUrl: GATEWAY_URL,
      debug: AUTH_NETWORK === 'dev',
      curve: app.curve,
    })
    const securityQuestionModule = new SecurityQuestionModule(3)
    securityQuestionModule.init(core)
    const isEnabled = await securityQuestionModule.isEnabled()
    userInfo.hasMfa = isEnabled
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
    info: GetInfoOutput & { hasMfa?: boolean; pk: string }
    sessionID: string
    sessionExpiry: number
    state?: string
    mnemonic?: string
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
      devLogger.log({ LOGININFO: ev.data })
      if (ev.data.mnemonic) {
        storage.session.setMnemonic(ev.data.mnemonic)
      }
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

async function handleCustomLoginRequest(params: {
  token: string
  userID: string
  provider: string
}) {
  const ap = await getAuthProvider(app.id)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  await ap.initKeyReconstructor()
  const kr = ap.keyReconstructor

  const info = await kr.getPrivateKey({
    verifier: params.provider,
    id: params.userID,
    idToken: params.token,
  })

  const userInfo = {
    loginType: params.provider as LoginType,
    hasMfa: false,
    privateKey: info.privateKey as string,
    pk: info.privateKey as string,
    userInfo: {
      id: params.userID,
    },
    token: '',
  }
  storeUserInfoAndRedirect(userInfo, true)
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
  const kr = ap.keyReconstructor

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
        loginType: 'firebase' as LoginType,
        hasMfa: false,
        privateKey: info.privateKey as string,
        pk: info.privateKey as string,
        userInfo: {
          id: data.uid,
        },
        token: '',
      }
      await storeUserInfoAndRedirect(userInfo, true)

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
