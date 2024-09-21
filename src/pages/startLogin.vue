<script setup lang="ts">
import { SocialLoginType } from '@arcana/auth-core'
import { Connection, connectToParent } from 'penpal'
import { onMounted, onUnmounted } from 'vue'

import { getAuthProvider } from '@/utils/getAuthProvider'
import { MLoginData } from '@/utils/storage'
import { getStorage, initStorage } from '@/utils/storageWrapper'

let conn: Connection<{
  goTo: (url: string) => void
}> | null = null

onMounted(async () => {
  conn = connectToParent<{
    goTo: (url: string) => void
  }>({
    methods: {
      setLoginData,
    },
    // eslint-disable-next-line no-undef
    parentOrigin: process.env.VUE_APP_WALLET_AUTH_URL,
  })
})
onUnmounted(() => {
  if (conn) {
    conn.destroy()
  }
})

const setLoginData = async (data: MLoginData) => {
  // FIXME: Verify redirectURL from appID
  initStorage(data.appID)
  getStorage().local.setLoginData(data)
  const authProvider = await getAuthProvider(data.appID)
  const val = await authProvider?.loginWithSocial(
    data.loginType as Exclude<SocialLoginType, SocialLoginType.passwordless>
  )
  if (val) {
    const c = await conn?.promise
    c?.goTo(val.url)
  }
}
</script>
