<script setup lang="ts">
import { getUniqueId } from 'json-rpc-engine'
import { onMounted, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

import AppLoader from '@/components/AppLoader.vue'
import NFTView from '@/components/NFTView.vue'
import UserWallet from '@/components/UserWallet.vue'
import { CHAIN_LIST } from '@/models/RpcConfigList'
import { useAppStore } from '@/store/app'
import { useParentConnectionStore } from '@/store/parentConnection'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const appStore = useAppStore()
const rpcStore = useRpcStore()
const parentConnectionStore = useParentConnectionStore()
const refreshState = ref(false)
const loader = ref({
  show: false,
  message: '',
})
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
  await getRpcConfig()
})

function showLoader(message) {
  loader.value.show = true
  loader.value.message = `${message}...`
}

function hideLoader() {
  loader.value.show = false
  loader.value.message = ''
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
  refreshState.value = true
}

onBeforeRouteLeave((to) => {
  if (to.path.includes('login')) parentConnection?.destroy()
})
</script>

<template>
  <div v-if="loader.show" class="flex justify-center items-center flex-1">
    <AppLoader :message="loader.message" />
  </div>
  <div v-else class="h-full">
    <UserWallet page="nft" @refresh="handleRefresh" />
    <div class="pb-5 flex flex-col gap-1">
      <div class="font-semibold">Assets</div>
      <div class="wallet__card rounded-[10px] flex flex-col">
        <NFTView
          :refresh-state="refreshState"
          @refreshed="refreshState = false"
        />
      </div>
    </div>
  </div>
</template>
