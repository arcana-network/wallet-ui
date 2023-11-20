import { AUTH_URL } from '@/utils/constants'
import { getWindowFeatures } from '@/utils/popupProps'

let openedWindow

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

function openRequestWindow(appId: string) {
  const u = new URL(`/${appId}/permission/`, AUTH_URL)
  if (!openedWindow) {
    openedWindow = window.open(u.href, '_blank', getWindowFeatures())
  }
  openedWindow.focus()
  return openedWindow
}

function sendRequest(request, openedWindow) {
  openedWindow.postMessage(request, AUTH_URL)
}

export { waitForLoad, openRequestWindow, sendRequest }
