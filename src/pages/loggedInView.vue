<script setup lang="ts">
import { AppMode } from '@arcana/auth'
import { LoginType } from '@arcana/auth-core/types/types'
import { Core, SecurityQuestionModule } from '@arcana/key-helper'
import type { Connection } from 'penpal'
import { onMounted, ref, onBeforeMount, type Ref } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'

import AppLoader from '@/components/AppLoader.vue'
import type { ParentConnectionApi } from '@/models/Connection'
import { RpcConfigWallet } from '@/models/RpcConfigList'
import { getEnabledChainList } from '@/services/chainlist.service'
import { useAppStore } from '@/store/app'
import { useParentConnectionStore } from '@/store/parentConnection'
import { useRequestStore } from '@/store/request'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import { AccountHandler } from '@/utils/accountHandler'
import { GATEWAY_URL, AUTH_NETWORK } from '@/utils/constants'
import { createParentConnection } from '@/utils/createParentConnection'
import { getAuthProvider } from '@/utils/getAuthProvider'
import getValidAppMode from '@/utils/getValidAppMode'
import { getWalletType } from '@/utils/getwalletType'
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
import { getStorage } from '@/utils/storageWrapper'

const userStore = useUserStore()
const appStore = useAppStore()
const rpcStore = useRpcStore()
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

onBeforeMount(() => {
  userStore.hasMfa =
    getStorage().local.getItem(`${userStore.info.id}-has-mfa`) === '1'
})

onMounted(async () => {
  try {
    await setRpcConfigs()
    await getRpcConfig()
    initKeeper()
    connectToParent()
    await getRpcConfigFromParent()
    await setTheme()
    await getAccountDetails()
    appStore.showWallet = true
    await setMFABannerState()
    const requestHandler = getRequestHandler()
    if (requestHandler) {
      requestHandler.setConnection(parentConnection)
      const { chainId, ...rpcConfig } =
        rpcStore.selectedRpcConfig as RpcConfigWallet
      const selectedChainId = Number(chainId)
      await requestHandler.setRpcConfig({
        chainId: selectedChainId,
        ...rpcConfig,
      })
      const parentConnectionInstance = await parentConnection.promise
      parentConnectionInstance.onEvent('connect', {
        chainId: selectedChainId,
      })
      watchRequestQueue(requestHandler)
    }
  } catch (e) {
    console.log(e)
  } finally {
    loader.value.show = false
  }
})

async function setMFABannerState() {
  if (!userStore.hasMfa) {
    const userInfo = JSON.parse(storage.session.getItem('userInfo') as string)
    const core = new Core(
      userInfo.pk,
      userStore.info.id,
      appStore.id,
      GATEWAY_URL,
      AUTH_NETWORK === 'dev'
    )
    const securityQuestionModule = new SecurityQuestionModule(3)
    securityQuestionModule.init(core)
    const isEnabled = await securityQuestionModule.isEnabled()
    userStore.hasMfa = isEnabled
  }
  const mfaDnd = storage.local.getItem(`${userStore.info.id}-mfa-dnd`)
  const mfaSkipUntil = storage.local.getItem(
    `${userStore.info.id}-mfa-skip-until`
  )
  const loginCount = storage.local.getItem(`${userStore.info.id}-login-count`)
  const hasMfaDnd = mfaDnd && mfaDnd === '1'
  const hasMfaSkip =
    mfaSkipUntil && loginCount && Number(loginCount) < Number(mfaSkipUntil)
  if (requestStore.areRequestsPendingForApproval) {
    router.push({ name: 'requests', params: { appId: appStore.id } })
  } else {
    router.push({ name: 'home' })
  }
  if (!userStore.hasMfa && !hasMfaDnd && !hasMfaSkip && !appStore.compactMode) {
    showMfaBanner.value = true
  }
}

async function getAccountDetails() {
  await initAccountHandler()
}

function initKeeper() {
  if (!requestHandlerExists()) {
    const accountHandler = new AccountHandler(
      userStore.privateKey,
      rpcStore.selectedRpcConfig.rpcUrls[0]
    )
    setRequestHandler(accountHandler)
  }
}

async function initAccountHandler() {
  try {
    if (parentConnection) {
      const parentConnectionInstance = await parentConnection.promise

      if (!userStore.walletAddress) {
        const account = getRequestHandler().getAccountHandler().getAccount()
        userStore.setWalletAddress(account.address)
      }

      if (typeof appStore.validAppMode !== 'number') {
        const walletType = await getWalletType(appStore.id)
        setAppMode(walletType, parentConnectionInstance)
      }
    }
  } catch (err) {
    console.log({ err })
  }
}

function connectToParent() {
  const sendRequest = getSendRequestFn(
    handleRequest,
    requestStore,
    appStore,
    getRequestHandler()
  )
  parentConnection = createParentConnection({
    isLoggedIn: () => userStore.isLoggedIn,
    sendRequest,
    getPublicKey: handleGetPublicKey,
    triggerLogout: handleLogout,
    getUserInfo,
    expandWallet: () => (appStore.expandWallet = true),
  })
  parentConnectionStore.setParentConnection(parentConnection)
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
    const htmlEl = document.getElementsByTagName('html')[0]
    if (theme === 'dark') htmlEl.classList.add(theme)
  }
}

function getUserInfo() {
  const accountDetails = getRequestHandler().getAccountHandler().getAccount()
  return {
    ...userStore.info,
    ...accountDetails,
  }
}

async function setAppMode(walletType, parentConnectionInstance) {
  const appModeFromParent = await parentConnectionInstance.getAppMode()
  const validAppMode = getValidAppMode(walletType, appModeFromParent)
  appStore.setAppMode(validAppMode as AppMode)
}

async function handleLogout() {
  appStore.sdkVersion = 'v2'
  if (parentConnection) {
    const parentConnectionInstance = await parentConnection.promise
    const authProvider = await getAuthProvider(appStore.id as string)
    await userStore.handleLogout(authProvider)
    parentConnectionInstance?.onEvent('disconnect')
    appStore.showWallet = false
  }
}

async function setRpcConfigs() {
  const { chains } = await getEnabledChainList(appStore.id)
  enabledChainList.value = chains.map((chain) => ({
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
  try {
    let rpcConfig =
      enabledChainList.value.find((chain) => chain.defaultChain) ||
      enabledChainList.value[0] // some time, chain list don't have default chain
    rpcStore.setSelectedRPCConfig(rpcConfig)
    rpcStore.setRpcConfig(rpcConfig)
  } catch (err) {
    console.log({ err })
  }
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
  const authProvider = await getAuthProvider(appStore.id as string)
  return await authProvider.getPublicKey({ id, verifier })
}

function handleSkip() {
  const loginCount = storage.local.getItem(`${userStore.info.id}-login-count`)
  const skipUntil = loginCount ? Number(loginCount) + 3 : 3
  storage.local.setItem(
    `${userStore.info.id}-mfa-skip-until`,
    String(skipUntil)
  )
  showMfaBanner.value = false
}

function handleMFACreation() {
  router.push({ name: 'MFARequired' })
  showMfaBanner.value = false
}

onBeforeRouteLeave((to) => {
  if (to.path.includes('login')) parentConnection?.destroy()
})
</script>

<template>
  <div v-if="loader.show" class="flex justify-center items-center flex-1">
    <AppLoader :message="loader.message" />
  </div>
  <div v-else class="flex flex-col gap-2">
    <Transition name="fade" mode="out-in">
      <button
        v-if="showMfaBanner"
        class="bg-blue-700 rounded-lg px-4 py-1 flex justify-between items-center cursor-pointer"
        @click.stop="handleMFACreation"
      >
        <div class="flex items-center gap-2">
          <span class="font-semibold text-white-100 text-sm"
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
  </div>
</template>
