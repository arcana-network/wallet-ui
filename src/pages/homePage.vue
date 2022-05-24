<script setup lang="ts">
import type { Connection } from 'penpal'
import { toRefs, onMounted } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { useToast } from 'vue-toastification'

import type { ParentConnectionApi } from '@/models/Connection'
import { useAppStore } from '@/store/app'
import { useRequestStore } from '@/store/request'
import { useUserStore } from '@/store/user'
import { AccountHandler } from '@/utils/accountHandler'
import { createParentConnection } from '@/utils/createParentConnection'
import { getAuthProvider } from '@/utils/getAuthProvider'
import { getWalletType } from '@/utils/getwalletType'
import { Keeper } from '@/utils/keeper'
import {
  getSendRequestFn,
  handleRequest,
  watchRequestQueue,
} from '@/utils/requestManagement'
import { useImage } from '@/utils/useImage'

const getImage = useImage()

const user = useUserStore()
const appStore = useAppStore()
const requestStore = useRequestStore()
const router = useRouter()
const toast = useToast()

const {
  info: { email, name },
  privateKey,
} = user
const { walletAddressShrinked, walletAddress } = toRefs(user)
const { id: appId } = appStore
let parentConnection: Connection<ParentConnectionApi> | null = null

onMounted(connectionToParent)

async function connectionToParent() {
  const walletType = await getWalletType(appId)

  const accountHandler = new AccountHandler(privateKey)

  const walletAddress = accountHandler.getAccounts()[0]
  user.setWalletAddress(walletAddress)

  const keeper = new Keeper(walletType, accountHandler)

  const sendRequest = getSendRequestFn(handleRequest, requestStore, appStore)

  parentConnection = createParentConnection({
    isLoggedIn: () => user.isLoggedIn,
    sendRequest,
    getPublicKey: handleGetPublicKey,
    triggerLogout: handleLogout,
    getUserInfo: () => JSON.stringify(user.info),
  })

  keeper.setConnection(parentConnection)
  watchRequestQueue(requestStore, keeper)

  const chainId = await accountHandler.getChainId()
  const parentConnectionInstance = await parentConnection.promise
  const appMode = await parentConnectionInstance.getAppMode()
  appStore.setAppMode(appMode)

  parentConnectionInstance.onEvent('connect', { chainId })
}

async function handleGetPublicKey(id, verifier) {
  const authProvider = await getAuthProvider(appId)
  return await authProvider.getPublicKey({ id, verifier })
}

function onCopyClick() {
  const walletAddressEl = document.getElementById('wallet-address')
  try {
    walletAddressEl.setAttribute('type', 'text')
    walletAddressEl.select()
    document.execCommand('copy')
    toast.success('Wallet address copied')
  } catch (e) {
    toast.error('Failed to copy wallet address')
  }
  walletAddressEl.setAttribute('type', 'hidden')
  window.getSelection().removeAllRanges()
}

async function handleLogout() {
  const parentConnectionInstance = await parentConnection?.promise
  const authProvider = await getAuthProvider(appId)
  await user.handleLogout(authProvider)
  parentConnectionInstance?.onEvent('disconnect')
  parentConnection?.destroy()
  router.push(`/${appId}/login`)
}

function onCloseClick() {
  router.push('/signMessage')
}

onBeforeRouteLeave((to) => {
  if (to.path.includes('login')) parentConnection?.destroy()
})
</script>

<template>
  <div class="home__container flow-container">
    <h1 class="home__title">Welcome</h1>
    <div class="home__body-container flow-element">
      <div class="home__body-content">
        <p class="home__body-content-label">Name</p>
        <p class="home__body-content-value">{{ name }}</p>
      </div>
      <div class="home__body-content">
        <p class="home__body-content-label">Email ID</p>
        <p class="home__body-content-value">{{ email }}</p>
      </div>
      <div class="home__body-content">
        <p class="home__body-content-label">Wallet Address</p>
        <p class="home__body-content-value">
          <span>{{ walletAddressShrinked }}</span>
          <input id="wallet-address" type="hidden" :value="walletAddress" />
          <button @click.stop.prevent="onCopyClick">
            <img
              :src="getImage('copy-icon')"
              alt="copy icon"
              class="home__body-copy-icon"
            />
          </button>
        </p>
      </div>
    </div>
    <div class="home__footer">
      <button class="home__footer-button-outline" @click="handleLogout">
        Logout
      </button>
      <button class="home__footer-button-filled" @click="onCloseClick">
        Close
      </button>
    </div>
  </div>
</template>

<style scoped>
.home__container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: var(--p-500) var(--p-400);
}

.home__title {
  width: 100%;
  font-size: var(--fs-500);
  font-weight: 600;
  text-align: left;
}

.home__body-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: var(--p-400);
  color: var(--fg-color);
  text-align: center;
  text-align: left;
  background: var(--debossed-box-color);
  border-radius: 10px;
  box-shadow: var(--debossed-shadow);
}

.home__body-content-label {
  margin-bottom: 4px;
  font-size: var(--fs-300);
  font-weight: 400;
}

.home__body-content-value {
  display: flex;
  align-items: center;
  font-size: var(--fs-400);
  font-weight: 400;
}

.home__body-copy-icon {
  width: 16px;
  height: 16px;
  margin-left: 12px;
}

.home__footer {
  display: flex;
  width: 100%;
  font-size: var(--fs-350);
}

.home__footer-button-outline {
  flex: 1;
  margin-right: 5px;
  color: var(--outlined-button-fg-color);
  border: 2px solid;
  border-color: var(--outlined-button-border-color);
  border-radius: 10px;
}

.home__footer-button-filled {
  flex: 1;
  margin-left: 5px;
  color: var(--filled-button-fg-color);
  background-color: var(--filled-button-bg-color);
  border-radius: 10px;
}
</style>
