<script setup lang="ts">
import type { Connection } from 'penpal'
import { storeToRefs } from 'pinia'
import { toRefs } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { useToast } from 'vue-toastification'

import type { ParentConnectionApi } from '@/models/Connection'
import { useAppStore } from '@/store/app'
import { useParentConnectionStore } from '@/store/parentConnection'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import { getAuthProvider } from '@/utils/getAuthProvider'
import { useImage } from '@/utils/useImage'

const getImage = useImage()

const user = useUserStore()
const appStore = useAppStore()
const router = useRouter()
const toast = useToast()
const rpcStore = useRpcStore()
const parentConnectionStore = useParentConnectionStore()
const { selectedRpcConfig } = storeToRefs(rpcStore)

const {
  info: { email, name },
} = user
const { walletAddressShrinked, walletAddress } = toRefs(user)
const { id: appId } = appStore
const parentConnection: Connection<ParentConnectionApi> | null =
  parentConnectionStore.parentConnection

async function copyToClipboard(value: string) {
  try {
    await navigator.clipboard.writeText(value)
    toast.success('Wallet address copied')
  } catch (err) {
    toast.error('Failed to copy wallet address')
  }
}

async function handleLogout() {
  const parentConnectionInstance = await parentConnection?.promise
  const authProvider = await getAuthProvider(appId)
  await user.handleLogout(authProvider)
  parentConnectionInstance?.onEvent('disconnect')
  setTimeout(() => {
    router.push(`/${appId}/login`)
  })
}

onBeforeRouteLeave((to) => {
  if (to.path.includes('login')) parentConnection?.destroy()
})
</script>

<template>
  <div class="home__container p-4 sm:p-2 space-y-5 sm:space-y-2">
    <h1 class="home__title">Welcome</h1>
    <div class="home__body-container space-y-4 sm:space-y-2">
      <div v-if="name" class="home__body-content">
        <p class="home__body-content-label">Name</p>
        <p class="home__body-content-value">{{ name }}</p>
      </div>
      <div class="home__body-content">
        <p class="home__body-content-label">Email ID</p>
        <p class="home__body-content-value">{{ email }}</p>
      </div>
      <div class="home__body-content">
        <p class="home__body-content-label">Network</p>
        <p class="home__body-content-value">
          {{ selectedRpcConfig?.chainName }}
        </p>
      </div>
      <div class="home__body-content">
        <p class="home__body-content-label">Wallet Address</p>
        <p class="home__body-content-value">
          <span>{{ walletAddressShrinked }}</span>
          <input id="wallet-address" type="hidden" :value="walletAddress" />
          <button @click="copyToClipboard(walletAddress)">
            <img
              :src="getImage('copy-icon')"
              alt="copy icon"
              class="home__body-copy-icon"
            />
          </button>
        </p>
      </div>
    </div>
    <div class="flex w-full text-sm sm:text-xs justify-center">
      <button
        class="home__footer-button-outline rounded-xl border-2 border-solid w-1/2"
        @click="handleLogout"
      >
        Logout
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

.home__footer-button-outline {
  color: var(--outlined-button-fg-color);
  border-color: var(--outlined-button-border-color);
}

.home__footer-button-filled {
  flex: 1;
  margin-left: 5px;
  color: var(--filled-button-fg-color);
  background-color: var(--filled-button-bg-color);
  border-radius: 10px;
}
</style>
