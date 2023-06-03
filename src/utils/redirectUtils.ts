import { GetInfoOutput } from '@arcana/auth-core'
import { AsyncMethodReturns } from 'penpal'

import { RedirectParentConnectionApi } from '@/models/Connection'
import { encrypt } from '@/utils/crypto'
import {
  getCredentialKey,
  setCredential,
} from '@/utils/PasswordlessLoginHandler'
import { getStorage } from '@/utils/storageWrapper'

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

function contactUsingBroadcastChannel(
  channel: BroadcastChannel,
  info: GetInfoOutput,
  messageId: number
) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      return reject('bc did not succeed')
    }, PASSWORDLESS_TIMEOUT)
    channel.addEventListener(
      'message',
      (ev: MessageEvent<{ status: string; messageId: number }>) => {
        if (
          ev.data?.status == 'LOGIN_INFO_ACK' &&
          ev.data?.messageId == messageId
        ) {
          clearTimeout(timer)
          return resolve('ok')
        }
      }
    )
    channel.postMessage({ status: 'LOGIN_INFO', info, messageId })
  })
}

function fetchPasswordlessResponseFromSignIn({
  sessionId,
  setToken,
}: {
  sessionId: string
  setToken: string
}) {
  return new Promise((resolve, reject) => {
    const state = `passwordless-${sessionId}-${setToken}`
    setTimeout(() => {
      return reject('request timed out')
    }, SOCIAL_TIMEOUT)

    const listener = (
      ev: MessageEvent<{
        status: string
        error: string | null
        success: boolean
      }>
    ) => {
      console.log({ ev: ev.data })
      if (ev.origin !== process.env.VUE_APP_WALLET_DOMAIN) {
        return
      }

      if (ev.data?.status === LOGIN_PWDL_INQ_RES) {
        window.removeEventListener('message', listener)
        const { error = null, success = false } = ev.data
        if (success) {
          return resolve('ok')
        } else {
          return reject(error)
        }
      }
    }
    try {
      const frameLength = window.parent.opener.frames.length
      window.addEventListener('message', listener)
      for (let i = 0; i < frameLength; i++) {
        try {
          window.parent.opener.frames[i].postMessage(
            {
              status: LOGIN_PWDL_INQ,
              state,
            },
            process.env.VUE_APP_WALLET_DOMAIN
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

function catchupSigninPage(state: string) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      return reject('request timed out')
    }, SOCIAL_TIMEOUT)

    const listener = (
      ev: MessageEvent<{ status: string; verified: boolean }>
    ) => {
      console.log({ ev: ev.data })
      if (ev.origin !== process.env.VUE_APP_WALLET_DOMAIN) {
        return
      }

      if (ev.data?.status === LOGIN_INIT_ACK) {
        window.removeEventListener('message', listener)
        return resolve('ok')
      }
    }
    try {
      const frameLength = window.parent.opener.frames.length
      window.addEventListener('message', listener)
      for (let i = 0; i < frameLength; i++) {
        try {
          window.parent.opener.frames[i].postMessage(
            {
              status: LOGIN_INIT,
              state,
            },
            process.env.VUE_APP_WALLET_DOMAIN
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

function verifyOpenerPage(state: string) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      return reject('request timed out')
    }, SOCIAL_TIMEOUT)

    const listener = (
      ev: MessageEvent<{ status: string; verified: boolean }>
    ) => {
      console.log({ ev: ev.data })
      if (ev.origin !== process.env.VUE_APP_WALLET_DOMAIN) {
        return
      }

      if (ev.data?.status === LOGIN_VERIFY_ACK) {
        if (ev.data.verified) {
          window.removeEventListener('message', listener)
          return resolve('ok')
        } else {
          window.removeEventListener('message', listener)
          return reject('could not verify parent')
        }
      }
    }
    try {
      const frameLength = window.parent.opener.frames.length
      window.addEventListener('message', listener)
      for (let i = 0; i < frameLength; i++) {
        try {
          window.parent.opener.frames[i].postMessage(
            {
              status: LOGIN_VERIFY,
              state,
            },
            process.env.VUE_APP_WALLET_DOMAIN
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

function contactParentPage(
  info: GetInfoOutput,
  messageId: number,
  status: string
) {
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
      window.addEventListener('message', listener)
      for (let i = 0; i < frameLength; i++) {
        try {
          window.parent.opener.frames[i].postMessage(
            {
              status,
              info,
              messageId: messageId,
            },
            process.env.VUE_APP_WALLET_DOMAIN
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

async function handlePasswordlessLogin(
  info: GetInfoOutput,
  messageId: number,
  parentAppUrl: string,
  connection: AsyncMethodReturns<RedirectParentConnectionApi>,
  channel: BroadcastChannel
) {
  try {
    await contactUsingBroadcastChannel(channel, info, messageId)
    connection.replyTo(parentAppUrl)
  } catch (e) {
    const url = new URL(parentAppUrl)
    url.hash = 'fLR=y'
    connection.redirect(url.toString())
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
  handlePasswordlessLogin,
  handlePasswordlessLoginV2,
  handleSocialLogin,
  catchupSigninPage,
  fetchPasswordlessResponseFromSignIn,
  contactParentPage,
  getStateFromUrl,
  verifyOpenerPage,
  MFA_SETUP,
  LOGIN_INFO,
  MFA_SETUP_ACK,
  LOGIN_INFO_ACK,
}
