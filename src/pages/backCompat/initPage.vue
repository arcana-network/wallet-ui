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
import emailScheme from '@/utils/emailScheme'
import { getAuthProvider } from '@/utils/getAuthProvider'
import {
  catchupSigninPage,
  fetchPasswordlessResponseFromSignIn,
} from '@/utils/redirectUtils'
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

initStorage(String(appId))

const penpalMethods = {
  triggerSocialLogin: (type: SocialLoginType) => handleSocialLoginRequest(type),
  triggerPasswordlessLogin: (email: string) =>
    handlePasswordlessLoginRequest(email),
}

// let loginSrc = ''

onMounted(init)

onUnmounted(() => {
  parentConnection?.destroy()
})

let authProvider: AuthProvider | null = null

async function init() {
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
    }
  } finally {
    isLoading.value = false
  }
}

async function handleSocialLoginRequest(
  type: Exclude<SocialLoginType, SocialLoginType.passwordless>
) {
  if (authProvider) {
    const { url, state } = await user.handleSocialLogin(authProvider, type)
    await catchupSigninPage(state)
    return url
  }
}

async function handlePasswordlessLoginRequest(email: string) {
  const isEmailValid = await emailScheme.isValid(email)
  if (isEmailValid) {
    const connection = await parentConnection?.promise
    const params = await connection?.getPasswordlessParams()
    if (!params) {
      throw new Error('No params found')
    }
    return await fetchPasswordlessResponseFromSignIn(params)
  }
}
</script>
<template>
  <div></div>
</template>
