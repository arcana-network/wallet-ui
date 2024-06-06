<script setup lang="ts">
import { getUniqueId } from 'json-rpc-engine'
import { onMounted, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

import AppLoader from '@/components/AppLoader.vue'
import NFTView from '@/components/NFTView.vue'
import { useAppStore } from '@/store/app'
import { useParentConnectionStore } from '@/store/parentConnection'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const appStore = useAppStore()
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
})

onBeforeRouteLeave((to) => {
  if (to.path.includes('login')) parentConnection?.destroy()
})
</script>

<template>
  <div v-if="loader.show" class="flex justify-center items-center flex-1">
    <AppLoader :message="loader.message" />
  </div>
  <div v-else class="h-full">
    <div class="pb-5 flex flex-col gap-3">
      <span class="font-lg font-medium">NFTs</span>
      <div class="flex flex-col overflow-hidden">
        <NFTView
          :refresh-state="refreshState"
          @refreshed="refreshState = false"
        />
      </div>
    </div>
  </div>
</template>
