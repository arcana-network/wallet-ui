<script setup lang="ts">
/*
---- Log-in
1. loginRedirect.vue creates a session ID, asks the parent app's Auth SDK to store it. It's opaque.
2. When re-initializing, it discovers that 3PC is disabled, so LS and SS are unusable, it asks the host app to trigger a reconnection,
2. asks for the session ID from the host application and sends a URL to open a reconnection.
3a. The reconnect URL is stored and an event is triggered, the developer then has to call .reconnectContinue/.reconnectPopup()
3b. This will use the previously stored reconnect URL and open a popup.
4. The popup in its normal order of business will open its wallet UI iframe, and it'll communicate the private key back to the host app's wallet UI
4. through the interactWithIframe. Continues to Reconnection №1.

---- Reconnection
1. Get a session ID from the auth verify (the parent application)
2. Check if the session ID is expired, if it's expired, delete the private keys and return an error
3. Get the info from Local Storage & call contactParentPage
*/
import { getUniqueId } from 'json-rpc-engine'
import { connectToParent } from 'penpal'
import type { AsyncMethodReturns } from 'penpal'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

import {
  interactWithIframe,
  LOGIN_INFO,
  LOGIN_INFO_ACK,
  MFA_SETUP_ACK,
} from '@/utils/redirectUtils'
import { getStorage, initStorage } from '@/utils/storageWrapper'

const EXPIRY_MS = 60 * 60 * 1000

interface ParentInterface {
  getSessionID(): string
  requestExit(): void
  reportError(txt: string): void
}

async function exitWithError(
  connxn: AsyncMethodReturns<ParentInterface>,
  error: string
) {
  await connxn.reportError(error)
}

onMounted(async () => {
  const route = useRoute()
  const iface = connectToParent<ParentInterface>()
  const connxn = await iface.promise

  initStorage(String(route.params.appId))
  const storage = getStorage()
  const uSessionID = await connxn.getSessionID()

  const { sessionID: actualSessionID, timestamp } =
    storage.local.getSession() ?? {}
  const currentTS = Date.now()

  if (actualSessionID == null) {
    return exitWithError(connxn, 'Session ID missing, or logged out')
  }

  // does this require constant-time comparison to ensure we don't leak information to a malicious application?
  if (uSessionID !== actualSessionID) {
    return exitWithError(connxn, 'Session ID mismatch')
  }

  if (!timestamp || currentTS - timestamp > EXPIRY_MS) {
    storage.local.clearIsLoggedIn()
    storage.local.clearSession()
    storage.local.clearUserInfo()
    return exitWithError(connxn, 'Session expired, try logging in again')
  }

  const userInfo = storage.local.getUserInfo() ?? {}
  const mid = getUniqueId()
  await interactWithIframe<{ messageId: number }>({
    status: LOGIN_INFO,
    params: {
      sessionID: actualSessionID,
      messageId: mid,
      info: userInfo,
    },
    expectedResponseStatus: [LOGIN_INFO_ACK, MFA_SETUP_ACK],
  })
  await connxn.requestExit()
})
</script>
