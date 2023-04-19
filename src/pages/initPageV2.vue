<script setup lang="ts">
import type { AuthProvider, SocialLoginType } from '@arcana/auth-core'
import type { Connection } from 'penpal'
import { toRefs, onMounted, ref, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import { useRoute } from 'vue-router'

import type { InitParentConnectionApi } from '@/models/Connection'
import { useAppStore } from '@/store/app'
import { useUserStore } from '@/store/user'
import { createInitParentConnection } from '@/utils/createParentConnection'
import emailScheme from '@/utils/emailSheme'
import { getAuthProvider } from '@/utils/getAuthProvider'
import { getStorage, initStorage } from '@/utils/storageWrapper'

const route = useRoute()
const user = useUserStore()
const app = useAppStore()
const isLoading: Ref<boolean> = ref(false)
let parentConnection: Connection<InitParentConnectionApi> | null = null

const {
  params: {
    value: { appId },
  },
} = toRefs(route)

const penpalMethods = {
  triggerSocialLogin: (type: SocialLoginType) => handleSocialLoginRequest(type),
  triggerPasswordlessLogin: (email: string) =>
    handlePasswordlessLoginRequest(email),
}

onMounted(init)

onUnmounted(() => {
  parentConnection?.destroy()
})

let authProvider: AuthProvider | null = null

async function init() {
  initStorage()
  isLoading.value = true
  try {
    app.setAppId(`${appId}`)
    authProvider = await getAuthProvider(`${appId}`)

    parentConnection = createInitParentConnection({
      ...penpalMethods,
    })
    const parentConnectionInstance = await parentConnection.promise

    if (user.isLoggedIn) {
      parentConnectionInstance.error(
        'User is already logged in! Redirecting back to app in 3'
      )
    } else {
      const parentAppUrl = await parentConnectionInstance.getParentUrl()
      const loginSrc = await parentConnectionInstance.getLoginSource()
      getStorage().local.setItem('parentAppUrl', parentAppUrl)
      getStorage().local.setItem('loginSrc', loginSrc)
    }
  } finally {
    isLoading.value = false
  }
}

async function handleSocialLoginRequest(type: SocialLoginType) {
  if (authProvider) {
    return await user.handleSocialLogin(authProvider, type)
  }
}

async function handlePasswordlessLoginRequest(email: string) {
  const isEmailValid = await emailScheme.isValid(email)
  if (isEmailValid) {
    const connection = await parentConnection?.promise
    const params = await connection?.getPasswordlessParams()
    getStorage().local.setItem('CURRENT_LOGIN_INFO', JSON.stringify(params))
    const authProvider = await getAuthProvider(app.id)
    return await user.handlePasswordlessLogin(authProvider, email, {
      withUI: true,
    })
  }
}
</script>
<template><div></div></template>
