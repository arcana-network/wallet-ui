import { GetInfoOutput } from '@arcana/auth-core'
import { AsyncMethodReturns } from 'penpal'

import { RedirectParentConnectionApi } from '@/models/Connection'
import { encrypt } from '@/utils/crypto'
import {
  getCredentialKey,
  setCredential,
} from '@/utils/PasswordlessLoginHandler'

const SOCIAL_TIMEOUT = 5000 // 5s timeout

function contactParentPage(info: GetInfoOutput, messageId: number) {
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
            ev.data?.status === 'LOGIN_INFO_ACK' &&
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
              status: 'LOGIN_INFO',
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

async function handlePasswordlessLogin(
  info: GetInfoOutput,
  connection: AsyncMethodReturns<RedirectParentConnectionApi>
) {
  const params = localStorage.getItem('CURRENT_LOGIN_INFO')
  if (!params) {
    console.log('params not found in local storage')
    return
  }
  localStorage.removeItem('CURRENT_LOGIN_INFO')
  const data = JSON.parse(params)

  const publicKey = await getCredentialKey(data.sessionId)
  const ciphertext = await encrypt(info.privateKey, publicKey)
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
    await contactParentPage(info, messageId)
    connection.replyTo(parentAppUrl)
  } catch (e) {
    console.log('A very unexpected error occurred', e)
    connection.error(
      'Could not login, an unexpected error occurred',
      parentAppUrl
    )
  }
}

export { handlePasswordlessLogin, handleSocialLogin }
