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
      hideLoader()
      router.push({ name: 'home' })
    } else if (data.status == 'error') {
      mfaWindow?.close()
      hideLoader()
      toast.error('Error occured while setting up MFA. Please try again')
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
  <div
    class="wallet__card rounded-[10px] w-full max-w-[40rem] m-auto h-max min-h-max overflow-y-auto p-4"
  >
    <div
      v-show="loader.show"
      class="fixed inset-0 flex justify-center items-center z-50 opacity-90 backdrop-blur bg-white dark:bg-black"
    >
      <AppLoader :message="loader.message" />
    </div>
    <div class="flex justify-between">
      <div class="modal-title font-semibold">Setup MFA</div>
      <img
        src="@/assets/images/close-icon.svg"
        class="cursor-pointer invert dark:invert-0"
        @click.stop="handleSkip"
      />
    </div>
    <div class="flex mt-4">
      <span style="font-size: var(--fs-300)">
        As the dApp “{{ appStore.name }}” interacts with sensitive information,
        it requires you to have Multi-Factor Authentication enabled. Would you
        like to do so now?
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
      <div class="flex justify-center gap-4">
        <button
          class="text-xs sm:text-xs font-medium text-black bg-transparent dark:text-white"
          type="submit"
          @click.stop="handleAskNever"
        >
          Don't ask me again
        </button>
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