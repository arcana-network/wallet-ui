<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

import AppLoader from '@/components/AppLoader.vue'
import { useAppStore } from '@/store/app'
import { useParentConnectionStore } from '@/store/parentConnection'
import { useUserStore } from '@/store/user'
import { AUTH_URL, DOCS_URL } from '@/utils/constants'
import { content, errors } from '@/utils/content'
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
  if (storage.session.getInAppLogin()) {
    router.push({
      name: 'MFASetup',
      params: { appId: appStore.id },
      query: {
        inApp: '1',
      },
    })
  } else {
    cleanExit = false
    const mfaSetupPath = new URL(`mfa/${appStore.id}/setup`, AUTH_URL)
    if (appStore.standaloneMode == 0) {
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
          storage.local.setHasMFA(user.info.id)
          user.hasMfa = true
          toast.success(content.MFA.SETUP)
          window.removeEventListener('message', handler, false)
          hideLoader()
          router.push({ name: 'home' })
        } else if (data.status == 'error') {
          mfaWindow?.close()
          window.removeEventListener('message', handler, false)
          hideLoader()
          if (data.error !== 'User cancelled the setup') toast.error(data.error)
        } else {
          toast.error(errors.MFA.ERROR)
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
    } else {
      const c = await useParentConnectionStore().parentConnection?.promise
      c?.uiEvent('mfa_setup', {})
    }
  }
}

function hideLoader() {
  loader.value = {
    show: false,
    message: '',
  }
}

function handleAskNever() {
  storage.local.setMFADND(user.info.id)
  goToHome()
}

function handleSkip() {
  const loginCount = storage.local.getLoginCount(user.info.id)
  const skipUntil = loginCount ? Number(loginCount) + 3 : 3
  storage.local.setMFASkip(user.info.id, skipUntil)
  goToHome()
}

function goToHome() {
  router.push({ name: 'home' })
}
</script>

<template>
  <div class="w-full overflow-y-auto flex">
    <div class="card p-4 m-auto h-max min-h-max">
      <div
        v-show="loader.show"
        class="fixed inset-0 flex justify-center items-center z-50 opacity-90 backdrop-blur bg-white dark:bg-black"
      >
        <AppLoader :message="loader.message" />
      </div>
      <div class="flex justify-center">
        <h1 class="font-Nohemi text-2xl font-medium">
          Enhance Wallet Security
        </h1>
      </div>
      <div
        class="mt-2 mb-6 flex flex-col gap-4 text-sm text-gray-spanish-light"
      >
        <span>
          “{{ appStore.name }}” suggests enabling Multi-factor Authentication
          (MFA) in your wallet for added security when logging in to new
          browsers or devices.
          <a
            :href="`${DOCS_URL}/concepts/mfa.html`"
            target="_blank"
            class="text-black-500 dark:text-white-100 font-medium cursor-pointer"
            >LEARN MORE</a
          >
        </span>
      </div>
      <div class="flex flex-col mt-4 gap-2">
        <button
          class="text-sm btn-primary accent-color font-medium p-2 cursor-pointer"
          type="submit"
          @click.stop="handleProceed"
        >
          Setup MFA
        </button>
        <div class="flex justify-center gap-6">
          <button
            class="text-xs btn-tertiary accent-color font-medium p-2 cursor-pointer"
            type="submit"
            @click.stop="handleSkip"
          >
            Skip for now
          </button>
          <button
            class="btn-tertiary accent-color font-medium text-sm p-2 cursor-pointer"
            type="submit"
            @click.stop="handleAskNever"
          >
            Don’t show again
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
hr {
  border-top: 1px solid #8d8d8d20;
}
</style>
