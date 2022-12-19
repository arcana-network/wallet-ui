<script setup lang="ts">
import { AppMode } from '@arcana/auth'
import { ethers } from 'ethers'
import { getUniqueId } from 'json-rpc-engine'
import type { Connection } from 'penpal'
import { storeToRefs } from 'pinia'
import { onMounted, ref, watch } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'

import AssetsView from '@/components/AssetsView.vue'
import UserWallet from '@/components/UserWallet.vue'
import type { ParentConnectionApi } from '@/models/Connection'
import { CHAIN_LIST } from '@/models/RpcConfigList'
import { useAppStore } from '@/store/app'
import { useParentConnectionStore } from '@/store/parentConnection'
import { useRequestStore } from '@/store/request'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import { AccountHandler, createNewAccountHandler } from '@/utils/accountHandler'
import { createParentConnection } from '@/utils/createParentConnection'
import { getAuthProvider } from '@/utils/getAuthProvider'
import getValidAppMode from '@/utils/getValidAppMode'
import { getWalletType } from '@/utils/getwalletType'
import { RequestHandler } from '@/utils/requestHandler'
import {
  getSendRequestFn,
  handleRequest,
  watchRequestQueue,
} from '@/utils/requestManagement'

const userStore = useUserStore()
const appStore = useAppStore()
const rpcStore = useRpcStore()
const parentConnectionStore = useParentConnectionStore()
const walletBalance = ref('')
const requestStore = useRequestStore()
const router = useRouter()
const { selectedChainId } = storeToRefs(rpcStore)
const loader = ref({
  show: false,
  message: '',
})
let accountHandler: AccountHandler
let keeper: RequestHandler
let parentConnection: Connection<ParentConnectionApi>
const assets: {
  name?: string
  symbol: string
  decimals: number
  balance: string
}[] = []

const helpOtherTabsLogin = () => {
  const channel = new BroadcastChannel(`${appStore.id}_login_notification`)
  channel.postMessage({
    status: 'LOGIN_INFO',
    info: { userInfo: { ...userStore.info }, privateKey: userStore.privateKey },
    messageId: getUniqueId(),
  })
  channel.close()
}

onMounted(async () => {
  loader.value.show = true
  loader.value.message = 'Loading...'
  helpOtherTabsLogin()
  setRpcConfigs()
  initAccounthandler()
  initKeeper()
  connectToParent()
  await setTheme()
  await getRpcConfig()
  await getAccountDetails()
  loader.value.show = false
})

watch(selectedChainId, () => {
  getAccountDetails()
})

function showLoader(message) {
  loader.value.show = true
  loader.value.message = `${message}...`
}

function hideLoader() {
  loader.value.show = false
  loader.value.message = ''
}

async function getAccountDetails() {
  await initAccountHandler()
  await getWalletBalance()
}

function initAccounthandler() {
  accountHandler = createNewAccountHandler(
    userStore.privateKey,
    rpcStore.selectedRpcConfig.rpcUrls[0]
  )
}

async function initKeeper() {
  keeper = new RequestHandler(accountHandler as AccountHandler)
}

async function initAccountHandler() {
  showLoader('Please wait')
  try {
    if (parentConnection) {
      const parentConnectionInstance = await parentConnection.promise

      if (!userStore.walletAddress) {
        const account = (accountHandler as AccountHandler).getAccount()
        userStore.setWalletAddress(account.address)
      }

      if (typeof appStore.validAppMode !== 'number') {
        const walletType = await getWalletType(appStore.id)
        setAppMode(walletType, parentConnectionInstance)
      }

      if (keeper) {
        keeper.setConnection(parentConnection)

        const { chainId, ...rpcConfig } = rpcStore.selectedRpcConfig
        const selectedChainId = Number(chainId)
        await keeper.setRpcConfig({ chainId: selectedChainId, ...rpcConfig })

        watchRequestQueue(keeper)

        parentConnectionInstance.onEvent('connect', {
          chainId: selectedChainId,
        })
      }
    }
  } catch (err) {
    console.log({ err })
  } finally {
    hideLoader()
  }
}

function connectToParent() {
  const sendRequest = getSendRequestFn(
    handleRequest,
    requestStore,
    appStore,
    keeper
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
      themeConfig: { theme },
      name: appName,
    } = await parentConnectionInstance.getAppConfig()

    appStore.setTheme(theme)
    appStore.setName(appName)
    const htmlEl = document.getElementsByTagName('html')[0]
    if (theme === 'dark') htmlEl.classList.add(theme)
  }
}

function getUserInfo() {
  const accountDetails = (accountHandler as AccountHandler).getAccount()
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
    showLoader('Loading')
    if (rpcStore.selectedChainId) return
    if (parentConnection) {
      const parentConnectionInstance = await parentConnection.promise
      const rpcConfig = await parentConnectionInstance.getRpcConfig()
      rpcStore.setSelectedChainId(`${parseInt(rpcConfig.chainId)}`)
    }
  } catch (err) {
    console.log({ err })
  } finally {
    hideLoader()
  }
}

async function handleGetPublicKey(id, verifier) {
  const authProvider = await getAuthProvider(appStore.id as string)
  return await authProvider.getPublicKey({ id, verifier })
}

async function getWalletBalance() {
  showLoader('Fetching Wallet Balance')
  try {
    if (accountHandler) {
      const balance =
        (await accountHandler.provider.getBalance(userStore.walletAddress)) ||
        '0'
      rpcStore.setWalletBalance(balance.toString())
      walletBalance.value = ethers.utils.formatEther(balance.toString())
      assets.push({ ...rpcStore.nativeCurrency, balance: balance.toString() })
    }
  } catch (err) {
    console.log({ err })
  } finally {
    hideLoader()
  }
}

onBeforeRouteLeave((to) => {
  if (to.path.includes('login')) parentConnection?.destroy()
})
</script>

<template>
  <div v-if="loader.show" class="flex justify-center items-center flex-1">
    <p class="sm:text-xs">{{ loader.message }}</p>
  </div>
  <div v-else>
    <UserWallet
      page="home"
      :wallet-balance="walletBalance"
      @refresh="getWalletBalance"
    />
    <div class="pb-5 flex flex-col gap-1">
      <div class="font-semibold">Assets</div>
      <div class="wallet__card rounded-[10px] flex flex-1 flex-col">
        <AssetsView />
      </div>
    </div>
  </div>
</template>

<style scoped>
.section-title {
  font-size: var(--fs-400);
}
</style>
