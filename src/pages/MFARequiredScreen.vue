<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

import AppLoader from '@/components/AppLoader.vue'
import { useAppStore } from '@/store/app'
import { useUserStore } from '@/store/user'
import { AUTH_URL } from '@/utils/constants'
import { getWindowFeatures } from '@/utils/popupProps'
import { getStorage } from '@/utils/storageWrapper'

const appStore = useAppStore()
const user = useUserStore()
const router = useRouter()
const toast = useToast()
let cleanExit = false
const loader = ref({
  show: false,
  message: '',
})
let mfaWindow: Window | null
const storage = getStorage()

async function handleProceed() {
  cleanExit = false
  const mfaSetupPath = new URL(`mfa/${appStore.id}/setup`, AUTH_URL)
  mfaWindow = window.open(
    mfaSetupPath.toString(),
    '_blank',
    getWindowFeatures()
  )
  const handler = async (event: MessageEvent) => {
    if (!event?.data?.status) {
      return
    }
    cleanExit = true
    const data = event.data

    if (data.status === 'success') {
      mfaWindow?.close()
      storage.local.setItem(`${user.info.id}-has-mfa`, '1')
      user.hasMfa = true
      toast.success('MFA setup completed')
      window.removeEventListener('message', handler, false)
      hideLoader()
      router.push({ name: 'home' })
    } else if (data.status == 'error') {
      mfaWindow?.close()
      window.removeEventListener('message', handler, false)
      hideLoader()
      if (data.error !== 'User cancelled the setup') toast.error(data.error)
    } else {
      toast.error('Error occured while setting up MFA. Please try again')
      console.log('Unexpected event')
    }
  }
  window.addEventListener('message', handler, false)

  loader.value = {
    show: true,
    message: 'Setting up MFA...',
  }

  const id = window.setInterval(() => {
    if (!cleanExit && mfaWindow?.closed) {
      console.error('User closed the popup')
      window.removeEventListener('message', handler, false)
      hideLoader()
      clearInterval(id)
    }
  }, 500)
}

function hideLoader() {
  loader.value = {
    show: false,
    message: '',
  }
}

function handleAskNever() {
  storage.local.setItem(`${user.info.id}-mfa-dnd`, '1')
  goToHome()
}

function handleSkip() {
  const loginCount = storage.local.getItem(`${user.info.id}-login-count`)
  const skipUntil = loginCount ? Number(loginCount) + 3 : 3
  storage.local.setItem(`${user.info.id}-mfa-skip-until`, String(skipUntil))
  goToHome()
}

function goToHome() {
  router.push({ name: 'home' })
}
</script>

<template>
  <div class="w-full overflow-y-auto flex">
    <div class="wallet__card rounded-[10px] p-4 m-auto h-max min-h-max">
      <div
        v-show="loader.show"
        class="fixed inset-0 flex justify-center items-center z-50 opacity-90 backdrop-blur bg-white dark:bg-black"
      >
        <AppLoader :message="loader.message" />
      </div>
      <div class="flex justify-between">
        <div class="modal-title font-semibold">Enhanced Wallet Security</div>
      </div>
      <div class="flex mt-4">
        <span style="font-size: var(--fs-300)">
          “{{ appStore.name }}” requires Two Factor Authentication (2FA) enabled
          in your wallet before you use the app. Would you like to do so now?
        </span>
      </div>
      <div class="flex flex-col mt-4 gap-2">
        <button
          class="text-sm sm:text-xs rounded-xl font-semibold text-white dark:bg-white bg-black dark:text-black w-full h-10 sm:h-8 uppercase"
          type="submit"
          @click.stop="handleProceed"
        >
          Proceed
        </button>
        <div class="flex justify-center gap-8">
          <button
            class="text-xs sm:text-xs font-semibold text-black bg-transparent dark:text-white uppercase"
            type="submit"
            @click.stop="handleAskNever"
          >
            Don’t ask again
          </button>
          <button
            class="text-xs sm:text-xs font-semibold text-black bg-transparent dark:text-white uppercase"
            type="submit"
            @click.stop="handleSkip"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
label {
  padding-left: 5px;
  font-size: var(--fs-300);
  font-weight: 600;
  color: var(--fg-color-secondary);
}

hr {
  border-top: 1px solid #8d8d8d20;
}

.title {
  font-size: var(--fs-500);
}

.description {
  font-size: var(--fs-250);
  color: var(--fg-color-secondary);
}
</style>
