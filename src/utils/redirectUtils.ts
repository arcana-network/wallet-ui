import { GetInfoOutput, SocialLoginType } from '@arcana/auth-core'
import { AsyncMethodReturns } from 'penpal'

import { RedirectParentConnectionApi } from '@/models/Connection'
import { encrypt } from '@/utils/crypto'
import {
  getCredentialKey,
  setCredential,
} from '@/utils/PasswordlessLoginHandler'

const SOCIAL_TIMEOUT = 5000 // 5s timeout
const PASSWORDLESS_TIMEOUT = 1500 // 1.5s timeout

const LOGIN_INFO = 'LOGIN_INFO'
const LOGIN_INFO_ACK = 'LOGIN_INFO_ACK'

const LOGIN_VERIFY = 'LOGIN_VERIFY'
const LOGIN_VERIFY_ACK = 'LOGIN_VERIFY_ACK'

const LOGIN_INIT = 'LOGIN_INIT'
const LOGIN_INIT_ACK = 'LOGIN_INIT_ACK'

const LOGIN_PWDL_INQ = 'LOGIN_PWDL_INQ'
const LOGIN_PWDL_INQ_RES = 'LOGIN_PWDL_INQ_RES'

const MFA_SETUP = 'MFA_SETUP'
const MFA_SETUP_ACK = 'MFA_SETUP_ACK'

const ACK = [LOGIN_INFO_ACK, MFA_SETUP_ACK]

interface InteractMessage {
  status: string
  params: { [k: string]: any }
  expectedResponseStatus: Array<string>
}

const interactWithIframe = <T>(
  input: InteractMessage,
  domain = process.env.VUE_APP_WALLET_DOMAIN
): Promise<T> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      return reject('request timed out')
    }, SOCIAL_TIMEOUT)
    const listener = (
      ev: MessageEvent<{ status: string; messageId: number }>
    ) => {
      if (ev.origin !== process.env.VUE_APP_WALLET_DOMAIN) {
        return
      }

      if (ACK.includes(ev.data?.status) && ev.data?.messageId == messageId) {
        window.removeEventListener('message', listener)
        return resolve('ok')
      }
    }
    try {
      const frameLength = window.parent.opener.frames.length
      const listener = (ev: MessageEvent<T & { status: string }>) => {
        if (ev.origin !== domain) {
          return
        }

        if (input.expectedResponseStatus.includes(ev.data.status)) {
          window.removeEventListener('message', listener)
          resolve(ev.data)
        }
      }
      window.addEventListener('message', listener)
      for (let i = 0; i < frameLength; i++) {
        try {
          window.parent.opener.frames[i].postMessage(
            {
              status: input.status,
              ...input.params,
            },
            domain
          )
        } catch (e) {
          // Intentionally ignoring errors
          continue
        }
      }
    } catch (e) {
      reject(new Error('Could not contact parent page, login did not succeed'))
    }
  })
}

const fetchPasswordlessResponseFromSignIn = async ({
  sessionId,
  setToken,
}: {
  sessionId: string
  setToken: string
}) => {
  const state = `passwordless-${sessionId}-${setToken}`
  const data = await interactWithIframe<{
    status: string
    error: string | null
    success: boolean
  }>({
    status: LOGIN_PWDL_INQ,
    params: {
      state,
    },
    expectedResponseStatus: [LOGIN_PWDL_INQ_RES],
  })

  const { error = null, success = false } = data
  if (success) {
    return 'ok'
  } else {
    return Promise.reject(error)
  }
}

const catchupSigninPage = async (state: string) => {
  return interactWithIframe<void>({
    status: LOGIN_INIT,
    params: {
      state,
    },
    expectedResponseStatus: [LOGIN_INIT_ACK],
  })
}

const verifyOpenerPage = async (state: string) => {
  const data = await interactWithIframe<{ verified: boolean }>({
    status: LOGIN_VERIFY,
    params: {
      state,
    },
    expectedResponseStatus: [LOGIN_VERIFY_ACK],
  })
  if (data?.verified) {
    return 'ok'
  } else {
    return Promise.reject('not ok')
  }
}

const contactParentPage = async (
  info: GetInfoOutput,
  messageId: number,
  status: string
) => {
  const data = await interactWithIframe<{ messageId: number }>({
    status,
    params: {
      messageId,
      info,
    },
    expectedResponseStatus: ACK,
  })
  if (data.messageId == messageId) {
    return 'ok'
  }
}

async function handlePasswordlessLoginV2(
  info: GetInfoOutput & { hasMfa?: boolean; pk?: string },
  state: string,
  connection: AsyncMethodReturns<RedirectParentConnectionApi>
) {
  const [, sessionId, setToken] = state.split('-')
  const publicKey = await getCredentialKey(sessionId)
  const dataToEncrypt = {
    privateKey: info.privateKey,
    pk: info.pk,
  }
  let ciphertext = await encrypt(JSON.stringify(dataToEncrypt), publicKey)
  if (info.hasMfa) {
    ciphertext = `${ciphertext}:has-mfa`
  }
  await setCredential(setToken, sessionId, ciphertext)
  connection.replyTo()
}

async function handleSocialLogin(
  info: GetInfoOutput,
  messageId: number,
  connection: AsyncMethodReturns<RedirectParentConnectionApi>
) {
  try {
    await contactParentPage(info, messageId, LOGIN_INFO)
    connection.replyTo()
  } catch (e) {
    console.log('A very unexpected error occurred', e)
    connection.error('Could not login, an unexpected error occurred')
  }
}

const getStateFromUrl = (u: string) => {
  let val = ''
  const url = new URL(decodeURIComponent(u), process.env.VUE_APP_WALLET_DOMAIN)
  const queryParams = url.searchParams
  const hashParams = new URLSearchParams(url.hash.substring(1))
  const key = 'state'
  val = hashParams.get(key) ?? ''
  if (!val) {
    val = queryParams.get(key) ?? ''
  }

  return val
}

type HandleLoginParams = {
  isStandalone: boolean
  userInfo: GetInfoOutput & {
    hasMfa?: boolean
    pk?: string
  }
  state: string
  connection: AsyncMethodReturns<RedirectParentConnectionApi>
  messageId: number
}

const handleLogin = async ({
  isStandalone,
  userInfo,
  state,
  connection,
  messageId,
}: HandleLoginParams) => {
  if (userInfo.loginType === SocialLoginType.passwordless) {
    await handlePasswordlessLoginV2(userInfo, state, connection)
  } else {
    if (isStandalone) {
      await connection.goToWallet()
      return
    }
    await handleSocialLogin(userInfo, messageId, connection)
  }
}

const getStateFromUrl = (u: string) => {
  let val = ''
  console.log({ u })
  const url = new URL(decodeURIComponent(u), process.env.VUE_APP_WALLET_DOMAIN)
  console.log({ url })
  const queryParams = url.searchParams
  const hashParams = new URLSearchParams(url.hash.substring(1))
  const key = 'state'
  val = hashParams.get(key) ?? ''
  if (!val) {
    val = queryParams.get(key) ?? ''
  }

  console.log({ val })
  return val
}
export {
  catchupSigninPage,
  fetchPasswordlessResponseFromSignIn,
  handleLogin,
  contactParentPage,
  getStateFromUrl,
  verifyOpenerPage,
  MFA_SETUP,
  LOGIN_INFO,
  MFA_SETUP_ACK,
  LOGIN_INFO_ACK,
}
