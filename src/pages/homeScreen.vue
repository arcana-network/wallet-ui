<script setup lang="ts">
import { ethers } from 'ethers'
import type { Connection } from 'penpal'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import type { Ref } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { useToast } from 'vue-toastification'

import ActivityView from '@/components/ActivityView.vue'
import AddNetwork from '@/components/AddNetwork.vue'
import AssetsView from '@/components/AssetsView.vue'
import BaseTabs from '@/components/BaseTabs.vue'
import ChangeChain from '@/components/ChangeChain.vue'
import EditNetwork from '@/components/EditNetwork.vue'
import ReceiveTokens from '@/components/ReceiveTokens.vue'
import SendTokens from '@/components/SendTokens.vue'
import type { ParentConnectionApi } from '@/models/Connection'
import { CHAIN_LIST } from '@/models/RpcConfigList'
import { getExchangeRate } from '@/services/exchangeRate.service'
import type { CurrencySymbol } from '@/services/exchangeRate.service'
import { useAppStore } from '@/store/app'
import { useModalStore } from '@/store/modal'
import { useParentConnectionStore } from '@/store/parentConnection'
import { useRequestStore } from '@/store/request'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import { AccountHandler } from '@/utils/accountHandler'
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
import { truncateToTwoDecimals } from '@/utils/truncateToTwoDecimal'
import { useImage } from '@/utils/useImage'

const EXCHANGE_RATE_CURRENCY: CurrencySymbol = 'USD'
type ModalState = 'send' | 'receive' | 'add-network' | 'edit-network' | false

const showModal: Ref<ModalState> = ref(false)
const getImage = useImage()
const userStore = useUserStore()
const appStore = useAppStore()
const rpcStore = useRpcStore()
const parentConnectionStore = useParentConnectionStore()
const modalStore = useModalStore()
const walletBalance = ref('')
const requestStore = useRequestStore()
const router = useRouter()
const toast = useToast()
const exchangeRate: Ref<number | null> = ref(null)
const { selectedChainId, currency } = storeToRefs(rpcStore)
const loader = ref({
  show: false,
  message: '',
})
let accountHandler: AccountHandler | null = null
let parentConnection: Connection<ParentConnectionApi> | null = null
const tabs = ['Assets', 'Activity']
const selectedTab = ref('Assets')
const assets: {
  name?: string
  symbol: string
  decimals: number
  balance: string
}[] = []

onMounted(async () => {
  setRpcConfigs()
  connectToParent()
  await getRpcConfig()
  await getAccountDetails()
})

watch(showModal, () => {
  if (!showModal.value) {
    showLoader('Loading')
    setTimeout(async () => {
      //need timeout before fetching balance, else the previous balance is fetched
      await getWalletBalance()
      hideLoader()
    }, 3000)
  }
})

watch(selectedChainId, () => {
  getAccountDetails()
})

const explorerUrl = computed(() => {
  if (rpcStore.selectedRpcConfig.blockExplorerUrls?.length) {
    const blockExplorerUrl = rpcStore.selectedRpcConfig.blockExplorerUrls[0]
    const walletAddress = userStore.walletAddress
    return `${blockExplorerUrl}/address/${walletAddress}`
  }
  return undefined
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
  await getCurrencyExchangeRate()
}

async function initAccountHandler() {
  showLoader('Please wait')
  try {
    const parentConnectionInstance = await parentConnection.promise

    accountHandler = new AccountHandler(userStore.privateKey)

    const account = accountHandler.getAccount()
    userStore.setWalletAddress(account.address)

    const walletType = await getWalletType(
      appStore.id,
      rpcStore.selectedRpcConfig.rpcUrls[0]
    )

    const keeper = new RequestHandler(accountHandler)
    keeper.setConnection(parentConnection)
    await keeper.setRpcConfig(rpcStore.selectedRpcConfig)

    watchRequestQueue(requestStore, keeper)

    setAppMode(walletType, parentConnectionInstance)

    const chainId = await accountHandler.getChainId()
    parentConnectionInstance.onEvent('connect', { chainId })
  } catch (err) {
    console.log({ err })
  } finally {
    hideLoader()
  }
}

function connectToParent() {
  const sendRequest = getSendRequestFn(handleRequest, requestStore, appStore)
  parentConnection = createParentConnection({
    isLoggedIn: () => userStore.isLoggedIn,
    sendRequest,
    getPublicKey: handleGetPublicKey,
    triggerLogout: handleLogout,
    getUserInfo,
  })
  parentConnectionStore.setParentConnection(parentConnection)
}

function getUserInfo() {
  const accountDetails = accountHandler.getAccount()
  return {
    ...userStore.info,
    ...accountDetails,
  }
}

async function setAppMode(walletType, parentConnectionInstance) {
  const appModeFromParent = await parentConnectionInstance.getAppMode()
  const validAppMode = getValidAppMode(walletType, appModeFromParent)
  appStore.setAppMode(validAppMode)
}

async function handleLogout() {
  const parentConnectionInstance = await parentConnection.promise
  const authProvider = await getAuthProvider(appStore.id)
  await userStore.handleLogout(authProvider)
  parentConnectionInstance?.onEvent('disconnect')
  setTimeout(() => {
    router.push(`/${appStore.id}/login`)
  })
}

function setRpcConfigs() {
  if (!rpcStore.rpcConfigs) rpcStore.setRpcConfigs(CHAIN_LIST)
}

async function getRpcConfig() {
  try {
    showLoader('Loading')
    if (rpcStore.selectedChainId) return
    const parentConnectionInstance = await parentConnection.promise
    const rpcConfig = await parentConnectionInstance.getRpcConfig()
    rpcStore.setSelectedChainId(rpcConfig.chainId)
  } catch (err) {
    console.log({ err })
  } finally {
    hideLoader()
  }
}

async function handleGetPublicKey(id, verifier) {
  const authProvider = await getAuthProvider(appStore.id)
  return await authProvider.getPublicKey({ id, verifier })
}

async function getCurrencyExchangeRate() {
  showLoader('Fetching Currency Rate')
  try {
    if (currency.value) {
      const rate = await getExchangeRate(
        currency.value as CurrencySymbol,
        EXCHANGE_RATE_CURRENCY
      )
      if (rate) exchangeRate.value = rate
    }
  } catch (err) {
    console.error(err)
    exchangeRate.value = null
  } finally {
    hideLoader()
  }
}

const totalAmountInUSD = computed(() => {
  if (exchangeRate.value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.round(Number(walletBalance.value) * exchangeRate.value))
  }
  return ''
})

async function getWalletBalance() {
  showLoader('Fetching Wallet Balance')
  try {
    const balance =
      (await accountHandler.provider.getBalance(userStore.walletAddress)) || '0'
    rpcStore.setWalletBalance(balance.toString())
    walletBalance.value = ethers.utils.formatEther(balance.toString())
    assets.push({ ...rpcStore.nativeCurrency, balance: balance.toString() })
  } catch (err) {
    console.log({ err })
  } finally {
    hideLoader()
  }
}

async function copyToClipboard(value: string) {
  try {
    await navigator.clipboard.writeText(value)
    toast.success('Wallet address copied')
  } catch (err) {
    toast.error('Failed to copy wallet address')
  }
}

function openSendTokens(open) {
  modalStore.setShowModal(open)
  showModal.value = open ? 'send' : false
}

function openReceiveTokens(open) {
  modalStore.setShowModal(open)
  showModal.value = open ? 'receive' : false
}

function openAddNetwork(open) {
  modalStore.setShowModal(open)
  showModal.value = open ? 'add-network' : false
}

function openEditNetwork(open, chainId: number | null = null) {
  modalStore.setShowModal(open)
  showModal.value = open ? 'edit-network' : false
  rpcStore.editChainId = chainId
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
    <div class="wallet__card rounded-[10px] flex flex-1 flex-col mb-[2.5rem]">
      <div class="px-4 py-5 sm:p-2 h-full flex flex-col justify-between">
        <div class="flex flex-col justify-center items-center space-y-2">
          <div class="flex items-center space-x-1">
            <p class="text-xl sm:text-sm">
              {{ userStore.walletAddressShrinked }}
            </p>
            <button
              class="h-4"
              @click="copyToClipboard(userStore.walletAddress)"
            >
              <img
                :src="getImage('copy-icon')"
                alt="copy icon"
                class="h-full"
              />
            </button>
          </div>
          <div class="flex items-center space-x-2 sm:space-x-1">
            <a
              v-if="explorerUrl"
              :href="explorerUrl"
              target="_blank"
              class="flex items-center space-x-1"
            >
              <img
                :src="getImage('arrow-up-right-icon')"
                alt="Explore"
                class="h-4"
              />
              <span class="text-xs">View on Explorer</span>
            </a>
            <button
              class="flex items-center space-x-1"
              @click="getWalletBalance"
            >
              <img
                :src="getImage('refresh-icon')"
                alt="Refresh wallet balance"
                class="w-4"
              />
              <span class="text-xs">Refresh</span>
            </button>
          </div>
        </div>
        <div class="space-y-1 relative pb-14 sm:pb-8 mt-8">
          <p class="text-xs text-zinc-400">Network</p>
          <div class="w-full rounded-lg absolute">
            <ChangeChain
              @add-network="openAddNetwork(true)"
              @edit-network="(chainId) => openEditNetwork(true, chainId)"
            />
          </div>
        </div>
        <div
          class="flex-1 w-full rounded-lg mx-auto flex flex-col justify-center items-center space-y-2 sm:space-y-0 bg-gradient mt-5"
        >
          <div
            class="p-4 sm:p-2 h-full flex flex-col justify-between space-y-5 sm:space-y-3 overflow-auto"
          >
            <div
              class="flex-1 w-full rounded-lg mx-auto flex flex-col justify-center items-center space-y-2 sm:space-y-0 bg-gradient"
            >
              <p class="text-sm sm:text-xs">Total Balance</p>
              <div
                v-if="exchangeRate"
                class="space-y-2 sm:space-y-0 flex flex-col items-center"
              >
                <p class="text-2xl sm:text-base text-center">
                  {{ totalAmountInUSD }}
                </p>
                <div class="flex text-zinc-400 text-sm space-x-1">
                  <p :title="walletBalance">
                    {{ truncateToTwoDecimals(walletBalance) }}
                  </p>
                  <p>{{ currency }}</p>
                </div>
              </div>
              <div v-else>
                <div class="flex text-2xl sm:text-base space-x-1">
                  <p :title="walletBalance">
                    {{ truncateToTwoDecimals(walletBalance) }}
                  </p>
                  <p>{{ currency }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex space-x-3 mt-10">
          <button
            class="text-sm sm:text-xs rounded-xl border-2 border-solid border-black dark:border-white flex-1"
            @click="openSendTokens(true)"
          >
            Send
          </button>
          <button
            class="text-sm sm:text-xs rounded-xl border-2 border-solid border-black dark:border-white flex-1"
            @click="openReceiveTokens(true)"
          >
            Receive
          </button>
        </div>
      </div>
    </div>
    <div class="wallet__card rounded-[10px] flex flex-1 flex-col mb-[2.5rem]">
      <BaseTabs v-model="selectedTab" :tabs="tabs" class="m-1" />
      <AssetsView v-if="selectedTab === 'Assets'" />
      <ActivityView v-else :currency-exchange-rate="exchangeRate" />
      <Teleport v-if="showModal" to="#modal-container">
        <SendTokens
          v-if="showModal === 'send'"
          @close="openSendTokens(false)"
        />
        <ReceiveTokens
          v-if="showModal === 'receive'"
          @close="openReceiveTokens(false)"
        />
        <AddNetwork
          v-if="showModal === 'add-network'"
          @close="openAddNetwork(false)"
        />
        <EditNetwork
          v-if="showModal === 'edit-network'"
          @close="openEditNetwork(false)"
        />
      </Teleport>
    </div>
  </div>
</template>
