import { GetInfoOutput } from '@arcana/auth-core'
import { AsyncMethodReturns } from 'penpal'

import { RedirectParentConnectionApi } from '@/models/Connection'

const WAIT_TIMEOUT = 5000 // 5s timeout

function contactUsingBroadcastChannel(
  channel: BroadcastChannel,
  info: GetInfoOutput,
  messageId: number
) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      return reject('bc did not succeed')
    }, WAIT_TIMEOUT)
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

function contactParentPage(info: GetInfoOutput, messageId: number) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      return reject('request timed out')
    }, WAIT_TIMEOUT)
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
  }
}

export { handlePasswordlessLogin, handleSocialLogin }
