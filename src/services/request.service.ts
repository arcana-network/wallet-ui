import { AUTH_URL } from '@/utils/constants'
import { getWindowFeatures } from '@/utils/popupProps'

let openedWindow: Window | null = null

function waitForLoad() {
  return new Promise((resolve) => {
    const handler = (ev: MessageEvent) => {
      if (ev.data.type === 'READY_TO_RECEIVE') {
        window.removeEventListener('message', handler)
        resolve('ok')
      }
    }
    window.addEventListener('message', handler, false)
  })
}

async function makeRequest(appId, request) {
  const u = new URL(`/${appId}/permission/`, AUTH_URL)
  if (!openedWindow?.window) {
    openedWindow = window.open(u.href, '_blank', getWindowFeatures())
    await waitForLoad()
  }
  openedWindow?.focus()
  openedWindow?.postMessage(request, AUTH_URL)
  return openedWindow
}

export { waitForLoad, makeRequest }
