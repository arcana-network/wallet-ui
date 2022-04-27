<script setup lang="ts">
import type { ParentConnectionApi } from '@src/models/Connection'
import { useAppStore } from '@src/store/app'
import { useRequestStore } from '@src/store/request'
import { useUserStore } from '@src/store/user'
import { AccountHandler } from '@src/utils/accountHandler'
import { permissions } from '@src/utils/callPermissionsConfig'
import { getAuthProvider } from '@src/utils/getAuthProvider'
import { getWalletType } from '@src/utils/getwalletType'
import { Keeper } from '@src/utils/keeper'
import {
  getSendRequestFn,
  handleRequest,
  watchRequestQueue,
} from '@src/utils/requestManagement'
import { useImage } from '@src/utils/useImage'
import { connectToParent } from 'penpal'
import { toRefs } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

const getImage = useImage()

const user = useUserStore()
const app = useAppStore()
const requestStore = useRequestStore()
const router = useRouter()
const toast = useToast()

const {
  info: { email, name },
  privateKey,
} = user
const { walletAddressShrinked, walletAddress } = toRefs(user)
const { id: appId } = app
const authProvider = getAuthProvider(appId)

async function connectionToParent() {
  const walletType = await getWalletType(appId)
  const accountHandler = new AccountHandler(privateKey)
  const walletAddress = accountHandler.getAccounts()[0]
  user.setWalletAddress(walletAddress)
  const keeper = new Keeper(privateKey, permissions, walletType, accountHandler)
  watchRequestQueue(requestStore, keeper)
  const sendRequest = getSendRequestFn(
    handleRequest,
    keeper,
    router,
    requestStore
  )
  const connectionInstance = await connectToParent<ParentConnectionApi>({
    methods: {
      sendRequest,
    },
  }).promise
  keeper.setConnection(connectionInstance)
}

connectionToParent()

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

async function onLogoutClick() {
  await user.handleLogout(authProvider)
  router.push(`/${appId}/login`)
}

function onCloseClick() {
  router.push('/signMessage')
}
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
      <button class="home__footer-button-outline" @click="onLogoutClick">
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
