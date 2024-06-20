<script setup lang="ts">
import { AuthProvider, type GetInfoOutput } from '@arcana/auth-core'
import { CURVE, Core, SecurityQuestionModule } from '@arcana/key-helper'
import { captureException, captureMessage } from '@sentry/vue'
import dayjs from 'dayjs'
import { addHexPrefix } from 'ethereumjs-util'
import { ethers } from 'ethers'
import { getUniqueId } from 'json-rpc-engine'
import { connectToParent } from 'penpal'
import { v4 as genUUID } from 'uuid'
import { onMounted } from 'vue'

import { type GlobalRedirectMethods } from '@/models/Connection'
import { useAppStore } from '@/store/app'
import { AUTH_NETWORK, GATEWAY_URL, SESSION_EXPIRY_MS } from '@/utils/constants'
import { errors } from '@/utils/content'
import { getDefaultParams } from '@/utils/getAuthProvider'
import { getLoginToken } from '@/utils/loginToken'
import { handleGlobalLogin } from '@/utils/redirectUtils'
import { are3PCEnabled } from '@/utils/storage'
import { getStorage, initStorage } from '@/utils/storageWrapper'

const app = useAppStore()

type LoginInfo = GetInfoOutput & {
  hasMfa?: boolean
  pk?: string
  address: string
  publicKey: string
}

onMounted(async () => {
  const connectionToParent = await connectToParent<GlobalRedirectMethods>({})
    .promise
  let id
  try {
    const params = getDefaultParams()
    const { provider, appId, state, cleanup } =
      await AuthProvider.fromGlobalRedirect({
        ...params,
        useInMemoryStore: !are3PCEnabled,
        debug: true,
      })
    id = appId
    initStorage(appId)

    const storage = getStorage()
    storage.session.setState(state)
    storage.local.setCurve(app.curve)

    app.id = appId
    app.isMfaEnabled = provider.appConfig.mfa_enabled
    app.curve =
      provider.appConfig.chain_type.toLowerCase() == 'evm'
        ? CURVE.SECP256K1
        : CURVE.ED25519

    const info = provider.getUserInfo()
    const userInfo: LoginInfo = {
      userInfo: info.userInfo,
      loginType: info.loginType,
      token: '',
      privateKey: '',
      publicKey: '',
      address: '',
    }
    storage.session.setUserInfo(info)
    const exp = dayjs().add(1, 'day')
    getStorage().local.setPK({
      pk: info.privateKey,
      exp,
      id: userInfo.userInfo.id,
    })
    if (app.isMfaEnabled) {
      const core = new Core({
        dkgKey: info.privateKey,
        userId: info.userInfo.id,
        appId: 'global',
        gatewayUrl: GATEWAY_URL,
        debug: AUTH_NETWORK === 'dev',
        curve: app.curve,
      })
      await core.init()
      userInfo.privateKey = await core.getKey()
      userInfo.hasMfa = storage.local.getHasMFA(userInfo.userInfo.id)
      userInfo.pk = info.privateKey
      if (!userInfo.hasMfa) {
        const securityQuestionModule = new SecurityQuestionModule(3)
        securityQuestionModule.init(core)
        userInfo.hasMfa = await securityQuestionModule.isEnabled()
      }
    }

    try {
      const loginToken = await getLoginToken({
        provider: info.loginType,
        token: info.token,
        userID: userInfo.userInfo.id,
        appID: appId,
        privateKey: userInfo.privateKey,
        curve: app.curve,
      })

      userInfo.token = loginToken
    } catch (e) {
      console.log(errors.LOGIN_TOKEN.FAILED, e)
    } finally {
      if (cleanup) {
        await cleanup()
      }
    }

    const uuid = genUUID()

    // For wallet usage purpose and standalone apps
    storage.session.setUserInfo(userInfo)
    storage.session.setIsLoggedIn()

    // For reconnect purpose
    storage.local.setUserInfo(userInfo)
    storage.local.setIsLoggedIn()
    storage.local.setSession({
      sessionID: uuid,
      timestamp: Date.now(),
    })

    const messageId = getUniqueId()
    storage.session.clearState()
    await handleGlobalLogin({
      connection: connectionToParent,
      userInfo,
      state: state,
      sessionID: uuid,
      sessionExpiry: Date.now() + SESSION_EXPIRY_MS,
      messageId,
      isStandalone: false,
    })
  } catch (e) {
    captureException(e)
    captureMessage(`Login failed on ${id}`)
    if (e instanceof Error && e.message == 'LOCAL_SHARE_MISSING') {
      connectionToParent.goToMfaRestore(id)
    } else {
      connectionToParent.setError(e as string)
    }
  }
})
</script>
