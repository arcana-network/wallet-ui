<script setup lang="ts">
import { AppMode } from '@arcana/auth'
import { LoginType } from '@arcana/auth-core/types/types'
import { Core, CURVE, SecurityQuestionModule } from '@arcana/key-helper'
import type { Connection } from 'penpal'
import {
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  type Ref,
  ref,
  watch,
} from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'

import AppLoader from '@/components/AppLoader.vue'
import PhraseSuccess from '@/components/CustomRequestScreen/Mnemonic/PhraseSuccess.vue'
import SeedPhrase from '@/components/CustomRequestScreen/Mnemonic/SeedPhrase.vue'
import SeedPhraseHome from '@/components/CustomRequestScreen/Mnemonic/SeedPhraseHome.vue'
import VerifyPhrase from '@/components/CustomRequestScreen/Mnemonic/VerifyPhrase.vue'
import UseWalletBalanceGasless from '@/components/UseWalletBalanceGasless.vue'
import type { ParentConnectionApi } from '@/models/Connection'
import { RpcConfigWallet } from '@/models/RpcConfigList'
import StarterTips from '@/pages/StarterTips/index-page.vue'
import { getEnabledChainList } from '@/services/chainlist.service'
import {
  getAppConfig,
  getGaslessEnabledStatus,
  AppConfig,
} from '@/services/gateway.service'
import { useActivitiesStore } from '@/store/activities'
import { useAppStore } from '@/store/app'
import { useConfigStore } from '@/store/config'
import useCurrencyStore from '@/store/currencies'
import { useGaslessStore } from '@/store/gasless'
import { useModalStore } from '@/store/modal'
import { useParentConnectionStore } from '@/store/parentConnection'
import { useRequestStore } from '@/store/request'
import { useRpcStore } from '@/store/rpc'
import { useStarterTipsStore } from '@/store/starterTips'
import { useUserStore } from '@/store/user'
import { CreateAccountHandler, EVMAccountHandler } from '@/utils/accountHandler'
import { ChainType } from '@/utils/chainType'
import { AUTH_NETWORK, GATEWAY_URL } from '@/utils/constants'
import { createParentConnection } from '@/utils/createParentConnection'
import { devLogger } from '@/utils/devLogger'
import { getAuthProvider } from '@/utils/getAuthProvider'
import getValidAppMode from '@/utils/getValidAppMode'
import { getWalletType } from '@/utils/getwalletType'
import { NEARRequestHandler } from '@/utils/near/requestHandler'
import {
  getRequestHandler,
  requestHandlerExists,
  setRequestHandler,
} from '@/utils/requestHandlerSingleton'
import {
  getSendRequestFn,
  handleRequest,
  watchRequestQueue,
} from '@/utils/requestManagement'
import { initSCW, scwInstance } from '@/utils/scw'
import { getPrivateKey } from '@/utils/solana/getPrivateKey'
import { getSensitiveStorage, getStorage } from '@/utils/storageWrapper'

const userStore = useUserStore()
const appStore = useAppStore()
const rpcStore = useRpcStore()
const gaslessStore = useGaslessStore()
const modalStore = useModalStore()
const activitiesStore = useActivitiesStore()
const starterTipsStore = useStarterTipsStore()
const showMfaBanner = ref(false)
const parentConnectionStore = useParentConnectionStore()
const requestStore = useRequestStore()
const router = useRouter()
const loader = ref({
  show: true,
  message: 'Loading...',
})
let parentConnection: Connection<ParentConnectionApi>
const storage = getStorage()
const enabledChainList: Ref<any[]> = ref([])
const currencyInterval = ref(null as any)
const showSeedPhraseModal = ref(false)
const showSeedPhraseHomeModal = ref(false)
const showSeedPhraseVerifyModal = ref(false)
const showSeedPhraseSuccessModal = ref(false)
const currencyStore = useCurrencyStore()
let config
let bc: BroadcastChannel | null = null
onBeforeMount(() => {
  userStore.hasMfa = getStorage().local.getHasMFA(userStore.info.id)
})

function startCurrencyInterval() {
  currencyStore.setLocalCurrencyCode()
  currencyStore.fetchAndSetExchangeRates()
  currencyInterval.value = setInterval(() => {
    currencyStore.fetchAndSetExchangeRates()
  }, 600000)
}

function stopCurrencyInterval() {
  if (currencyInterval.value) clearInterval(currencyInterval.value)
}

function setShowStarterTips() {
  const userId = userStore.info.id
  const loginCount = storage.local.getLoginCount(userId)
  const hasStarterTipShown = storage.local.getHasStarterTipShown(userId)
  if (Number(loginCount) <= 2 && !hasStarterTipShown) {
    starterTipsStore.setShowStarterTips()
    return
  }
}

function setShowSeedPhrase() {
  const mnemonic = storage.session.getMnemonic()
  const shouldBeShown = !!mnemonic
  const userId = userStore.info.id
  const loginCount = storage.local.getLoginCount(userId)
  const hasMVXSeedShown = storage.local.gethasMVXSeedShown(userId)
  if (Number(loginCount) <= 2 && !hasMVXSeedShown) {
    if (shouldBeShown) {
      handleShowSeedPhraseHomeModal()
      return
    }
  }
}

const startLoginChannel = () => {
  const sensitiveStorage = getSensitiveStorage()
  bc = new BroadcastChannel(`${appStore.id}_login_helper`)
  bc.onmessage = (e) => {
    const info = sensitiveStorage.getUserInfo()
    devLogger.log('Got request from a tab', { e, info })
    if (e.data.method === 'LOGIN_HELP') {
      bc?.postMessage({
        method: 'LOGIN_HELP_RESPONSE',
        response_data: info,
      })
    }
    if (e.data.method === 'LOGOUT') {
      sensitiveStorage.removeUserInfo()
      logout()
    }
  }
}

async function handleSeedPhrase() {
  showSeedPhraseHomeModal.value = false
  showSeedPhraseModal.value = true
}

async function handleSeedPhraseVerify() {
  showSeedPhraseModal.value = false
  showSeedPhraseVerifyModal.value = true
}

async function handleSeedPhraseSuccess() {
  showSeedPhraseVerifyModal.value = false
  showSeedPhraseSuccessModal.value = true
}

function handleShowSeedPhraseHomeModal() {
  modalStore.setShowModal(true)
  showSeedPhraseHomeModal.value = true
}

function handleHideSeedPhraseHomeModal() {
  modalStore.setShowModal(false)
  showSeedPhraseHomeModal.value = false
}

function handleBacktoSeed() {
  modalStore.setShowModal(true)
  showSeedPhraseVerifyModal.value = false
  showSeedPhraseModal.value = true
}

const sendLogoutMessage = () => {
  getSensitiveStorage().removeUserInfo()
  bc?.postMessage({
    method: 'LOGOUT',
  })
}

const getRadius = (radius: string) => {
  switch (radius) {
    case 'S':
      return '4px'
    case 'M':
      return '8px'
    case 'L':
      return '12px'
    case 'XL':
      return '16px'
    default:
      return '0px'
  }
}

function setThemeSettings(theme: AppConfig['theme_settings']) {
  const { font_pairing, radius, accent_color, font_color } = theme
  const font = font_pairing.split('+').map((f) => f.trim())
  const primaryFont = font[0].split(' ').join('-')
  const secondaryFont = font[1].split(' ').join('-')

  const body = document.getElementsByTagName('body')[0]
  body.classList.add(`font-${secondaryFont}`)
  body.style.color = font_color

  const h1 = document.getElementsByTagName('h1')[0]
  h1.classList.add(`font-${primaryFont}`)

  const radiusValue = getRadius(radius)
  const appEl = document.getElementById('appEl')
  if (appEl && appStore.expandWallet) appEl.style.borderRadius = radiusValue

  const stylesheet = document.styleSheets[0] as CSSStyleSheet
  stylesheet.insertRule(
    `.accent-color { color: ${accent_color} !important }`,
    0
  )
  stylesheet.insertRule(
    `.accent-color { border-color: ${accent_color} !important }`,
    1
  )
}

onMounted(async () => {
  try {
    config = await useConfigStore(appStore.id)
    setTimeout(() => {
      setThemeSettings(config.themeSettings)
    }, 1000)
    startLoginChannel()
    loader.value.show = true
    devLogger.log('[loggedInView]', { curve: appStore.curve })
    devLogger.log('[loggedInView] before keygen', userStore.privateKey)
    if (appStore.curve === CURVE.ED25519) {
      userStore.privateKey = await getPrivateKey(userStore.privateKey)
    }
    devLogger.log('[loggedInView] after keygen', userStore.privateKey)

    await setRpcConfigs().then(() => getRpcConfig())

    await connectToParent()
    // await getRpcConfigFromParent()
    sendAddressType(rpcStore.preferredAddressType)
    await setTheme()
    await getAccountDetails()
    startCurrencyInterval()
    appStore.showWallet = true
    await setMFABannerState()
    const requestHandler = getRequestHandler()
    if (requestHandler) {
      requestHandler.setConnection(parentConnection)
      const { chainId, ...rpcConfig } =
        rpcStore.selectedRpcConfig as RpcConfigWallet
      const selectedChainId = Number(chainId)
      requestHandler
        .setRpcConfig({
          chainId: selectedChainId,
          ...rpcConfig,
        })
        .then(() => requestHandler.sendConnect())
      if (
        rpcStore.isGaslessConfigured &&
        appStore.chainType === ChainType.evm_secp256k1
      ) {
        await initScwSdk()
      }
      watchRequestQueue(requestHandler)
    }
  } catch (e) {
    console.log(e)
  } finally {
    loader.value.show = false
    setShowSeedPhrase()
    // setShowStarterTips()
  }
})

onBeforeUnmount(() => {
  bc?.close()
})

async function initScwSdk() {
  try {
    const requestHandler = getRequestHandler()
    const accountHandler = requestHandler.getAccountHandler()
    await initSCW(
      appStore.id,
      (accountHandler as EVMAccountHandler).getSigner()
    )
    userStore.scwAddress = scwInstance.scwAddress
  } catch (e) {
    console.log(e)
  }
}

async function setMFABannerState() {
  // return null

  // eslint-disable-next-line no-unreachable
  if (!userStore.hasMfa && appStore.isMfaEnabled) {
    const userInfo = storage.local.getUserInfo()
    if (!userInfo) {
      return
    }
    devLogger.log('[loggedInView] before core', {
      dkgKey: userInfo.pk as string,
      userId: userStore.info.id,
      appId: appStore.id,
      gatewayUrl: GATEWAY_URL,
      debug: AUTH_NETWORK === 'dev',
      curve: appStore.curve,
    })
    const core = new Core({
      dkgKey: userInfo.pk as string,
      userId: userStore.info.id,
      appId: appStore.id,
      gatewayUrl: GATEWAY_URL,
      debug: AUTH_NETWORK === 'dev',
      curve: appStore.curve,
    })
    const securityQuestionModule = new SecurityQuestionModule(3)
    securityQuestionModule.init(core)
    userStore.hasMfa = await securityQuestionModule.isEnabled()
  }
  const hasMfaDnd = storage.local.HasMFADND(userStore.info.id)
  const mfaSkipUntil = storage.local.getMFASkip(userStore.info.id)
  const loginCount = storage.local.getLoginCount(userStore.info.id)
  const hasMfaSkip =
    mfaSkipUntil && loginCount && Number(loginCount) < Number(mfaSkipUntil)
  if (requestStore.areRequestsPendingForApproval) {
    await router.push({ name: 'requests', params: { appId: appStore.id } })
  } else {
    await router.push({ name: 'home' })
  }
  if (!userStore.hasMfa && !hasMfaDnd && !hasMfaSkip && !appStore.compactMode) {
    showMfaBanner.value = true
  }
}

async function getAccountDetails() {
  await initAccountHandler()
}

function initKeeper(rpcUrl: string) {
  if (!requestHandlerExists()) {
    const accountHandler = CreateAccountHandler(
      userStore.privateKey,
      rpcUrl,
      appStore.chainType
    )
    setRequestHandler(accountHandler)
  }
}

async function initAccountHandler() {
  try {
    if (parentConnection) {
      const parentConnectionInstance = await parentConnection.promise
      const account = getRequestHandler().getAccountHandler().getAccount()
      userStore.setWalletAddress(account.address)
      if (appStore.chainType === ChainType.near_cv25519) {
        await (getRequestHandler() as NEARRequestHandler).setRpcConfig(
          rpcStore.selectedRpcConfig || enabledChainList.value[0]
        )
      }
      if (typeof appStore.validAppMode !== 'number') {
        let walletMode = storage.local.getWalletMode()
        if (walletMode == null) {
          const walletType = await getWalletType(appStore.id)
          devLogger.log('walletType', walletType)
          storage.local.setWalletMode(walletType)
          walletMode = walletType
        }
        await setAppMode(walletMode, parentConnectionInstance)
      }
    }
  } catch (err) {
    console.log({ err })
  }
}

async function addToActivity(request) {
  if (request.error === 'user_closed_popup') {
    requestStore.skippedRequests[request.req.id] = {
      request: request.req,
      isPermissionGranted: false,
      requestOrigin: 'auth-verify',
    }
  } else if (request.result) {
    if (request.req.method === 'eth_sendTransaction') {
      await activitiesStore.fetchAndSaveActivityFromHash({
        txHash: request.result,
        chainId: `${Number(request.chainId)}`,
      })
    } else if (
      request.req.method === 'eth_signTypedData_v4' &&
      request.req.params[1]
    ) {
      const params = JSON.parse(request.req.params[1])
      if (params.domain.name === 'Arcana Forwarder') {
        await activitiesStore.saveFileActivity(
          `${Number(request.chainId)}`,
          params.message,
          params.domain.verifyingContract
        )
      }
    }
  }
}

async function connectToParent() {
  if (!parentConnection) {
    parentConnection = createParentConnection({
      isLoggedIn: () => userStore.isLoggedIn,
      sendRequest: getSendRequestFn(
        handleRequest,
        requestStore,
        appStore,
        getRequestHandler()
      ),
      addToActivity,
      getKeySpaceConfigType: () => (config.global ? 'global' : 'local'),
      getPublicKey: handleGetPublicKey,
      triggerLogout: handleLogout,
      logout,
      getUserInfo,
      expandWallet: () => (appStore.expandWallet = true),
    })
    parentConnectionStore.setParentConnection(parentConnection)
  }
  await parentConnection.promise
}

async function setTheme() {
  if (parentConnection) {
    const parentConnectionInstance = await parentConnection.promise
    const {
      themeConfig: {
        theme,
        assets: { logo },
      },
      name: appName,
    } = await parentConnectionInstance.getAppConfig()

    if (parentConnectionInstance.getSDKVersion) {
      appStore.sdkVersion = await parentConnectionInstance.getSDKVersion()
    }

    if (appStore.sdkVersion === 'v3') {
      const walletPosition = await parentConnectionInstance.getWalletPosition()
      appStore.setWalletPosition(walletPosition)
    }

    appStore.setTheme(theme)
    appStore.setAppLogo(logo)
    appStore.setName(appName)
    storage.local.storeThemePreference(theme)
    const htmlEl = document.getElementsByTagName('html')[0]
    if (theme === 'dark') htmlEl.classList.add('dark')
  }
}

function getUserInfo() {
  const accountDetails = getRequestHandler().getAccountHandler().getAccount()
  return {
    loginType: userStore.loginType,
    loginToken: userStore.token,
    userDIDToken: userStore.userDIDToken,
    ...userStore.info,
    ...accountDetails,
  }
}

async function setAppMode(walletType, parentConnectionInstance) {
  const appModeFromParent = await parentConnectionInstance.getAppMode()
  const validAppMode = getValidAppMode(walletType, appModeFromParent)
  appStore.setAppMode(validAppMode as AppMode)
}

async function logout() {
  appStore.showWallet = false
  const authProvider = await getAuthProvider(appStore.id as string)
  await userStore.handleLogout(authProvider)
  sendLogoutMessage()
  getRequestHandler().onDisconnect()
  router.push(`/${appStore.id}/v2/login?logout=1`)
}

async function handleLogout() {
  if (parentConnectionStore.parentConnection) {
    const parentConnectionInstance = await parentConnectionStore
      .parentConnection.promise
    sendLogoutMessage()
    getRequestHandler().onDisconnect()
    const authProvider = await getAuthProvider(appStore.id as string)
    await userStore.handleLogout(authProvider)
    parentConnectionInstance?.onEvent('disconnect')
    appStore.showWallet = false
  }
}

async function setRpcConfigs() {
  const { chains } = await getEnabledChainList(appStore.id)
  enabledChainList.value = chains
    .filter((chain) => {
      const network = chain.compatibility?.toLowerCase()
      switch (appStore.chainType) {
        case ChainType.multiversx_cv25519:
          return network === 'multiversx'
        case ChainType.solana_cv25519:
          return network === 'solana'
        case ChainType.near_cv25519:
          return network === 'near'
        default:
          return network === 'evm'
      }
    })
    .map((chain) => ({
      chainId: chain.chain_id,
      rpcUrls: [chain.rpc_url],
      chainName: chain.name,
      chainType: chain.chain_type,
      blockExplorerUrls: [chain.exp_url],
      isCustom: false,
      nativeCurrency: {
        symbol: chain.currency,
        decimals: 18,
      },
      defaultChain: chain.default_chain,
    }))
  if (!rpcStore.rpcConfigs) rpcStore.setRpcConfigs(enabledChainList.value)
}

async function getRpcConfig() {
  let rpcConfig =
    enabledChainList.value.find((chain) => chain.defaultChain) ||
    enabledChainList.value[0] // some time, chain list don't have default chain
  initKeeper(rpcConfig.rpcUrls[0])
  rpcStore.setSelectedRPCConfig(rpcConfig)
  rpcStore.setRpcConfig(rpcConfig)
}

async function getRpcConfigFromParent() {
  try {
    const parentConnectionInstance = await parentConnection.promise
    const rpcConfig = await parentConnectionInstance.getRpcConfig()
    if (rpcConfig) {
      const chainId = Number(rpcConfig.chainId)
      const chainToBeSet = enabledChainList.value.find(
        (chain) => chain.chainId === chainId
      )
      if (chainToBeSet) {
        rpcStore.setSelectedRPCConfig(chainToBeSet)
        rpcStore.setRpcConfig(chainToBeSet)
      }
    }
  } catch (err) {
    console.log({ err })
  }
}

async function handleGetPublicKey(id: string, verifier: LoginType) {
  const authProvider = await getAuthProvider(appStore.id)
  return await authProvider.getPublicKey({ id, verifier })
}

function handleSkip() {
  const loginCount = storage.local.getLoginCount(userStore.info.id)
  const skipUntil = loginCount ? Number(loginCount) + 3 : 3
  storage.local.setMFASkip(userStore.info.id, skipUntil)
  showMfaBanner.value = false
}

function handleMFACreation() {
  router.push({ name: 'MFARequired' })
  showMfaBanner.value = false
}

onBeforeUnmount(() => {
  parentConnectionStore.parentConnection?.destroy
  stopCurrencyInterval()
})

onBeforeRouteLeave((to) => {
  if (to.path.includes('login')) parentConnection?.destroy()
})

async function checkIfGaslessEnabled(chainId: string, appId: string) {
  let isGaslessEnabled = false
  try {
    isGaslessEnabled = await (
      await getGaslessEnabledStatus(appId, chainId)
    ).data.status
  } catch (e) {
    isGaslessEnabled = false
  } finally {
    rpcStore.setGaslessEnabledStatus(chainId as string, isGaslessEnabled)
  }
}

function getWalletAddressType() {
  let preferredAddressType = storage.local.getPreferredAddressType()
  if (!preferredAddressType) {
    preferredAddressType = rpcStore.isGaslessConfigured ? 'scw' : 'eoa'
    storage.local.setPreferredAddressType(preferredAddressType)
  } else {
    preferredAddressType = !rpcStore.isGaslessConfigured
      ? 'eoa'
      : preferredAddressType
  }
  rpcStore.setPreferredWalletAddressType(preferredAddressType)
}

async function sendAddressType(addressType: string) {
  const parentConnectionInstance = await parentConnection.promise
  if (parentConnectionInstance.setAddressType) {
    parentConnectionInstance.setAddressType(addressType)
  }
}

watch(
  () => rpcStore.preferredAddressType,
  () => {
    const addressType = rpcStore.preferredAddressType
    getRequestHandler().sendAddressType(addressType)
    storage.local.setPreferredAddressType(addressType)
  }
)

watch(
  () => rpcStore.selectedChainId,
  async () => {
    try {
      if (!requestHandlerExists()) return
      loader.value.show = true
      const chainId = rpcStore.selectedChainId
      const appId = appStore.id
      await checkIfGaslessEnabled(chainId as string, appId as string)
      getWalletAddressType()
      if (rpcStore.isGaslessConfigured) {
        const requestHandler = getRequestHandler()
        const { chainId, ...rpcConfig } =
          rpcStore.selectedRpcConfig as RpcConfigWallet
        await requestHandler.setRpcConfig({
          chainId: Number(chainId),
          ...rpcConfig,
        })
        await initScwSdk()
      }
    } catch (e) {
      console.log({ e })
    } finally {
      loader.value.show = false
    }
  }
)

watch(
  () => modalStore.show,
  () => {
    if (!modalStore.show) {
      showSeedPhraseHomeModal.value = false
      showSeedPhraseModal.value = false
      showSeedPhraseVerifyModal.value = false
      showSeedPhraseSuccessModal.value = false
    }
  }
)
</script>

<template>
  <div v-if="loader.show" class="flex justify-center items-center flex-1">
    <AppLoader :message="loader.message" />
  </div>
  <div v-else class="flex flex-col gap-2">
    <Transition name="fade" mode="out-in">
      <button
        v-if="showMfaBanner && appStore.isMfaEnabled"
        class="bg-blue-700 rounded-lg px-4 py-1 flex justify-between items-center cursor-pointer"
        @click.stop="handleMFACreation"
      >
        <div class="flex items-center gap-2">
          <span class="font-medium text-white-100 text-sm"
            >Enhance your wallet security</span
          >
          <img src="@/assets/images/export.svg" class="w-5" />
        </div>
        <img
          src="@/assets/images/close-icon.svg"
          class="w-6 -mr-[0.5rem]"
          @click.stop="handleSkip"
        />
      </button>
    </Transition>
    <RouterView v-slot="{ Component }" class="flex-grow w-full">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
    <StarterTips
      v-if="starterTipsStore.show"
      @close="starterTipsStore.setHideStarterTips()"
    />
    <Teleport v-if="modalStore.show" to="#modal-container">
      <UseWalletBalanceGasless
        v-if="gaslessStore.showUseWalletBalancePermission"
      />
      <SeedPhraseHome
        v-if="showSeedPhraseHomeModal"
        @proceed="handleSeedPhrase"
        @close="handleHideSeedPhraseHomeModal"
      />
      <SeedPhrase
        v-if="showSeedPhraseModal"
        @close="handleHideSeedPhraseHomeModal"
        @verify="handleSeedPhraseVerify"
      />
      <VerifyPhrase
        v-if="showSeedPhraseVerifyModal"
        @success="handleSeedPhraseSuccess"
        @close="handleBacktoSeed"
      />
      <PhraseSuccess
        v-if="showSeedPhraseSuccessModal"
        @close="handleHideSeedPhraseHomeModal"
      />
    </Teleport>
  </div>
</template>
