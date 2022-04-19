<script setup>
import { connectToParent } from 'penpal'
import { toRefs } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

import { useAppStore } from '@/store/app'
import { useRequestStore } from '@/store/request'
import { useUserStore } from '@/store/user'
import { AccountHandler } from '@/utils/accountHandler'
import { permissions } from '@/utils/callPermissionsConfig'
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
const authProvider = getAuthProvider(`${appId}`)

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
  const connectionInstance = await connectToParent({
    methods: {
      sendRequest,
    },
  }).promise
  keeper.setConnection(connectionInstance)
}

connectionToParent()

function onCopyClick() {
  const walletAddressEl = document.getElementById('wallet-address')
  walletAddressEl.setAttribute('type', 'text')
  walletAddressEl.select()
  document.execCommand('copy')
  try {
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
  <div class="wallet_home-container">
    <h1 class="wallet_home-title">Welcome</h1>
    <div class="wallet_home-body_container">
      <div class="wallet_home-body-content">
        <p class="wallet_home-body-content_label">Name</p>
        <p class="wallet_home-body-content_value">{{ name }}</p>
      </div>
      <div class="wallet_home-body-content">
        <p class="wallet_home-body-content_label">Email ID</p>
        <p class="wallet_home-body-content_value">{{ email }}</p>
      </div>
      <div class="wallet_home-body-content">
        <p class="wallet_home-body-content_label">Wallet Address</p>
        <p class="wallet_home-body-content_value">
          <span>{{ walletAddressShrinked }}</span>
          <input id="wallet-address" type="hidden" :value="walletAddress" />
          <button @click.stop.prevent="onCopyClick">
            <img
              :src="getImage('copy-icon')"
              alt="copy icon"
              class="wallet_home-body-copy-icon"
            />
          </button>
        </p>
      </div>
    </div>
    <div class="wallet_home-footer">
      <button class="wallet_home-footer_button-outline" @click="onLogoutClick">
        Logout
      </button>
      <button class="wallet_home-footer_button-filled" @click="onCloseClick">
        Close
      </button>
    </div>
  </div>
</template>

<style>
.wallet_home-container {
  height: 100%;
  padding: 20px 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}

.wallet_home-title {
  font-weight: 600;
  font-size: 20px;
  text-align: left;
  width: 100%;
  margin-bottom: 15px;
}

.wallet_home-body_container {
  display: flex;
  flex-direction: column;
  width: 100%;
  background: var(--debossed-box-color);
  padding: 20px 20px;
  color: var(--fg-color);
  border-radius: 10px;
  box-shadow: var(--debossed-shadow);
  text-align: center;
  margin-bottom: 15px;
  height: 100%;
  text-align: left;
}

.wallet_home-body_container > * {
  margin-bottom: 20px;
}

.wallet_home-body-content_label {
  font-weight: 400;
  font-size: 12px;
  margin-bottom: 4px;
}

.wallet_home-body-content_value {
  font-weight: 400;
  font-size: 16px;
  display: flex;
  align-items: center;
}

.wallet_home-body-copy-icon {
  width: 16px;
  height: 16px;
  margin-left: 12px;
}

.wallet_home-footer {
  width: 100%;
  display: flex;
}

.wallet_home-footer_button-outline {
  flex: 1;
  border: 2px solid;
  border-color: var(--outlined-button-border-color);
  color: var(--outlined-button-fg-color);
  margin-right: 5px;
  border-radius: 10px;
}

.wallet_home-footer_button-filled {
  flex: 1;
  background-color: var(--filled-button-bg-color);
  color: var(--filled-button-fg-color);
  height: 40px;
  border-radius: 10px;
  margin-left: 5px;
}
</style>
