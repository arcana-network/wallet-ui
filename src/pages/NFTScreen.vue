<script setup lang="ts">
import { getUniqueId } from 'json-rpc-engine'
import { storeToRefs } from 'pinia'
import { onMounted, ref, watch } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

import NFTView from '@/components/NFTView.vue'
import UserWallet from '@/components/UserWallet.vue'
import { CHAIN_LIST } from '@/models/RpcConfigList'
import { useAppStore } from '@/store/app'
import { useParentConnectionStore } from '@/store/parentConnection'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import {
  AccountHandler,
  createNewAccountHandler,
  getAccountHandler,
} from '@/utils/accountHandler'

const userStore = useUserStore()
const appStore = useAppStore()
const rpcStore = useRpcStore()
const parentConnectionStore = useParentConnectionStore()
const { selectedChainId } = storeToRefs(rpcStore)
const loader = ref({
  show: false,
  message: '',
})
let accountHandler: AccountHandler = getAccountHandler()
let parentConnection = parentConnectionStore.parentConnection

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
  helpOtherTabsLogin()
  setRpcConfigs()
  initAccounthandler()
  await getRpcConfig()
})

watch(selectedChainId, () => {
  initAccounthandler()
})

function showLoader(message) {
  loader.value.show = true
  loader.value.message = `${message}...`
}

function hideLoader() {
  loader.value.show = false
  loader.value.message = ''
}

function initAccounthandler() {
  accountHandler = createNewAccountHandler(
    userStore.privateKey,
    rpcStore.selectedRpcConfig.rpcUrls[0]
  )
}

function setRpcConfigs() {
  if (!rpcStore.rpcConfigs) rpcStore.setRpcConfigs(CHAIN_LIST)
}

async function getRpcConfig() {
  try {
    showLoader('Loading')
    if (rpcStore.selectedChainId) return
    const parentConnectionInstance = await parentConnection?.promise
    const rpcConfig = await parentConnectionInstance?.getRpcConfig()
    if (rpcConfig) rpcStore.setSelectedChainId(`${parseInt(rpcConfig.chainId)}`)
  } catch (err) {
    console.log({ err })
  } finally {
    hideLoader()
  }
}

async function handleRefresh() {
  showLoader('Fetching Wallet Balance')
  hideLoader()
}

onBeforeRouteLeave((to) => {
  if (to.path.includes('login')) parentConnection?.destroy()
})
</script>

<template>
  <div v-if="loader.show" class="flex justify-center items-center flex-1">
    <p class="sm:text-xs">{{ loader.message }}</p>
  </div>
  <div v-else class="h-full">
    <UserWallet @refresh="handleRefresh" />
    <div class="pb-5 flex flex-col gap-1">
      <div class="font-semibold">Assets</div>
      <div class="wallet__card rounded-[10px] flex flex-col">
        <NFTView />
      </div>
    </div>
  </div>
</template>
