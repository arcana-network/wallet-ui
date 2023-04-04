<script setup lang="ts">
import { AppMode } from '@arcana/auth'
import { LoginType } from '@arcana/auth-core/types/types'
import dayjs from 'dayjs'
import type { Connection } from 'penpal'
import { onMounted, ref, onBeforeMount } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'

import AppLoader from '@/components/AppLoader.vue'
import type { ParentConnectionApi } from '@/models/Connection'
import { CHAIN_LIST } from '@/models/RpcConfigList'
import { useAppStore } from '@/store/app'
import { useParentConnectionStore } from '@/store/parentConnection'
import { useRequestStore } from '@/store/request'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import { AccountHandler } from '@/utils/accountHandler'
import { createParentConnection } from '@/utils/createParentConnection'
import { getAuthProvider } from '@/utils/getAuthProvider'
import getValidAppMode from '@/utils/getValidAppMode'
import { getWalletType } from '@/utils/getwalletType'
import {
  getRequestHandler,
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
const parentConnectionStore = useParentConnectionStore()
const requestStore = useRequestStore()
const router = useRouter()
const loader = ref({
  show: true,
  message: 'Loading...',
})
let parentConnection: Connection<ParentConnectionApi>
const storage = getStorage()

onBeforeMount(() => {
  userStore.hasMfa =
    getStorage().local.getItem(`${userStore.info.id}-has-mfa`) === '1'
})

onMounted(async () => {
  setRpcConfigs()
  initKeeper()
  connectToParent()
  await setTheme()
  await getRpcConfig()
  await getAccountDetails()
  appStore.showWallet = true
  const mfaDnd = storage.local.getItem(`${userStore.info.id}-mfa-dnd`)
  const mfaSkipUntil = storage.local.getItem(
    `${userStore.info.id}-mfa-skip-until`
  )
  const loginCount = storage.local.getItem(`${userStore.info.id}-login-count`)
  const hasMfaDnd = mfaDnd && mfaDnd === '1'
  const hasMfaSkip =
    mfaSkipUntil && loginCount && Number(loginCount) < Number(mfaSkipUntil)
  if (userStore.hasMfa || hasMfaDnd || hasMfaSkip) {
    router.push({ name: 'home' })
  } else {
    router.push({ name: 'MFARequired' })
  }
  loader.value.show = false
})

async function getAccountDetails() {
  await initAccountHandler()
}

async function initKeeper() {
  const accountHandler = new AccountHandler(
    userStore.privateKey,
    rpcStore.selectedRpcConfig.rpcUrls[0]
  )
  setRequestHandler(accountHandler)
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

      const requestHandler = getRequestHandler()
      if (requestHandler) {
        requestHandler.setConnection(parentConnection)
        const { chainId, ...rpcConfig } = rpcStore.selectedRpcConfig
        const selectedChainId = Number(chainId)
        await requestHandler.setRpcConfig({
          chainId: selectedChainId,
          ...rpcConfig,
        })

        watchRequestQueue(requestHandler)

        parentConnectionInstance.onEvent('connect', {
          chainId: selectedChainId,
        })
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

    const walletPosition = await parentConnectionInstance.getWalletPosition()

    appStore.setTheme(theme)
    appStore.setAppLogo(logo)
    appStore.setName(appName)
    appStore.setWalletPosition(walletPosition)
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

async function handleLogout(isV2 = false) {
  if (parentConnection) {
    const parentConnectionInstance = await parentConnection.promise
    const authProvider = await getAuthProvider(appStore.id as string)
    await userStore.handleLogout(authProvider)
    parentConnectionInstance?.onEvent('disconnect')
    setTimeout(() => {
      appStore.showWallet = false
      const route = isV2 ? `/${appStore.id}/v2/login` : `/${appStore.id}/login`
      router.push(route)
    })
  }
}

function setRpcConfigs() {
  if (!rpcStore.rpcConfigs) rpcStore.setRpcConfigs(CHAIN_LIST)
}

async function getRpcConfig() {
  try {
    if (parentConnection) {
      const parentConnectionInstance = await parentConnection.promise
      let rpcConfig = await parentConnectionInstance.getRpcConfig()
      if ([40404, 40405].includes(Number(rpcConfig.chainId))) {
        rpcConfig = CHAIN_LIST[0]
      }
      if (rpcConfig) {
        const selectedChain = CHAIN_LIST.find(
          (chain) => Number(chain.chainId) === Number(rpcConfig.chainId)
        )
        rpcStore.setSelectedRPCConfig({
          ...rpcConfig,
          favicon: selectedChain ? selectedChain.favicon : 'blockchain-icon',
          isCustom: false,
        })
        rpcStore.setRpcConfig({
          ...rpcConfig,
          favicon: selectedChain ? selectedChain.favicon : 'blockchain-icon',
          isCustom: false,
        })
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

onBeforeRouteLeave((to) => {
  if (to.path.includes('login')) parentConnection?.destroy()
})
</script>

<template>
  <div v-if="loader.show" class="flex justify-center items-center flex-1">
    <AppLoader :message="loader.message" />
  </div>
  <div v-else class="flex">
    <RouterView v-slot="{ Component }" class="flex-grow w-full">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </div>
</template>
