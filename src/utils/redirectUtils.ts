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

function contactParentPage(
  info: GetInfoOutput,
  messageId: number,
  status: string
) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      return reject('request timed out')
    }, SOCIAL_TIMEOUT)
    try {
      const frameLength = window.parent.opener.frames.length
      window.addEventListener(
        'message',
        (ev: MessageEvent<{ status: string; messageId: number }>) => {
          if (ev.origin !== process.env.VUE_APP_WALLET_DOMAIN) {
            return
          }

          if (
            ACK.includes(ev.data?.status) &&
            ev.data?.messageId == messageId
          ) {
            return resolve('ok')
          }
        }
      )
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
  connection: AsyncMethodReturns<RedirectParentConnectionApi>
) {
  const storage = getStorage()
  const params = storage.local.getItem('CURRENT_LOGIN_INFO')
  if (!params) {
    console.log('params not found in local storage')
    throw new Error('No passwordless login init')
  }
  storage.local.removeItem('CURRENT_LOGIN_INFO')
  const data = JSON.parse(params)

  const publicKey = await getCredentialKey(data.sessionId)
  const dataToEncrypt = {
    privateKey: info.privateKey,
    pk: info.pk,
  }
  let ciphertext = await encrypt(JSON.stringify(dataToEncrypt), publicKey)
  if (info.hasMfa) {
    ciphertext = `${ciphertext}:has-mfa`
  }
  await setCredential(data.setToken, data.sessionId, ciphertext)
  connection.replyTo()
}

async function handleSocialLogin(
  info: GetInfoOutput,
  messageId: number,
  parentAppUrl: string,
  connection: AsyncMethodReturns<RedirectParentConnectionApi>
) {
  try {
    await contactParentPage(info, messageId, LOGIN_INFO)
    connection.replyTo(parentAppUrl)
  } catch (e) {
    console.log('A very unexpected error occurred', e)
    connection.error(
      'Could not login, an unexpected error occurred',
      parentAppUrl
    )
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
export {
  handlePasswordlessLogin,
  handlePasswordlessLoginV2,
  handleSocialLogin,
  contactParentPage,
  MFA_SETUP,
  LOGIN_INFO,
  MFA_SETUP_ACK,
  LOGIN_INFO_ACK,
}
