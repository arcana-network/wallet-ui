<script setup lang="ts">
import { toRefs, ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import WalletFooter from '@/components/AppFooter.vue'
import BaseModal from '@/components/BaseModal.vue'
import { useAppStore } from '@/store/app'
import { useModalStore } from '@/store/modal'
import { useRequestStore } from '@/store/request'
import { useUserStore } from '@/store/user'

import '@/index.css'

const user = useUserStore()
const app = useAppStore()
const modal = useModalStore()
const requestStore = useRequestStore()
const router = useRouter()
const { theme } = toRefs(app)
const isLoading = ref(false)
const route = useRoute()

onMounted(init)

const showRequestPage = computed(() => {
  return requestStore.areRequestsPendingForApproval
})

watch(showRequestPage, () => {
  if (showRequestPage.value) {
    modal.show = false
    router.push({ name: 'requests' })
  }
})

async function init() {
  isLoading.value = true
  try {
    const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}')
    const isLoggedIn = sessionStorage.getItem('isLoggedIn')

    if (isLoggedIn) {
      user.setUserInfo(userInfo)
      user.setLoginStatus(true)
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div v-if="isLoading" class="flex col justify-center items-center h-full">
    <div>Loading...</div>
  </div>
  <!-- TODO: Replace it with loading indicator -->
  <div
    v-else
    class="flex flex-col h-full"
    :class="[theme === 'dark' ? 'dark-mode' : 'light-mode']"
  >
    <div class="flex-grow wallet__container">
      <RouterView class="min-h-full" />
      <BaseModal v-if="modal.show" />
    </div>
    <WalletFooter
      v-if="route.name !== 'requests' || !requestStore.pendingRequest"
    />
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@100;400;600;700&display=block');
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600&display=block');
@import '@/assets/css/reset.css';

:root {
  --color-light: #f9f9f9;
  --color-dark: #101010;
  --color-philippine-gray: #8d8d8d;
  --color-light-disabled: #f9f9f9af;
  --color-dark-disabled: #101010af;
  --color-state-green: #5dab5c;
  --color-state-red: #b43030;
  --color-state-yellow: #b07641;
  --color-gradient-light: linear-gradient(
    324.81deg,
    #d6d8d9 14.65%,
    rgb(232 232 232 / 36%) 92.36%
  );
  --color-gradient-dark: radial-gradient(
    134.5% 939.99% at -23.59% -12.9%,
    #262626 0%,
    #1a1a1a 31.41%,
    rgb(32 32 32 / 76%) 100%
  );
  --box-shadow-light: inset -1px -1px 1px rgb(255 255 255 / 70%),
    inset 1px 1px 2px rgb(174 174 192 / 20%);
  --box-shadow-dark: inset -2px -2px 4px rgb(57 57 57 / 44%),
    inset 5px 5px 10px rgb(11 11 11 / 50%);
  --debossed-light-color: #eee;
  --debossed-dark-color: #161616;
  --debossed-box-shadow-light: inset 5px 5px 10px 5px rgb(255 255 255 / 70%);
  --debossed-box-shadow-dark: inset 5px 5px 10px 5px #121212;
  --fs-500: 20px;
  --fs-550: 18px;
  --fs-400: 16px;
  --fs-350: 14px;
  --fs-300: 12px;
  --fs-250: 10px;
  --p-500: 20px;
  --p-450: 18px;
  --p-400: 16px;
  --p-350: 14px;
  --p-300: 12px;
  --p-250: 10px;
  --flow-space-container: 30px;
  --flow-space-element: 20px;
}

@media (max-width: 235px) {
  :root {
    --fs-500: 16px;
    --fs-450: 14px;
    --fs-400: 12px;
    --fs-350: 10px;
    --fs-300: 8px;
    --fs-250: 6px;
    --p-500: 16px;
    --p-550: 14px;
    --p-400: 12px;
    --p-350: 10px;
    --p-300: 8px;
    --p-250: 6px;
    --flow-space-container: 15px;
    --flow-space-element: 10px;
  }
}

.light-mode {
  --fg-color: var(--color-dark);
  --fg-color-secondary: var(--color-philippine-gray);
  --bg-gradient: var(--color-gradient-light);
  --content-bg-color: var(--color-light);
  --container-bg-color: #f2f2f2;
  --debossed-box-color: var(--debossed-light-color);
  --debossed-shadow: var(--debossed-box-shadow-light);
  --card-shadow: 4px 5px 4px #f0f0f3;
  --card-bg: #f9f9f9;
  --filled-button-bg-color: var(--color-dark);
  --filled-button-fg-color: var(--color-light);
  --outlined-button-border-color: var(--color-dark);
  --outlined-button-fg-color: var(--color-dark);
  --button-bg-disabled: var(--color-dark-disabled);
  --scrollbar-thumb-color: #ddd;
  --request-footer-bg: rgb(235 235 235 / 70%);
}

.dark-mode {
  --fg-color: var(--color-light);
  --fg-color-secondary: var(--color-philippine-gray);
  --bg-gradient: var(--color-gradient-dark);
  --content-bg-color: var(--color-gradient-dark);
  --container-bg-color: #1e1e1e;
  --debossed-box-color: var(--debossed-dark-color);
  --debossed-shadow: var(--debossed-box-shadow-dark);
  --card-shadow: 4px 5px 4px #181818;
  --card-bg: #262626;
  --filled-button-bg-color: var(--color-light);
  --filled-button-fg-color: var(--color-dark);
  --outlined-button-border-color: var(--color-light);
  --outlined-button-fg-color: var(--color-light);
  --button-bg-disabled: var(--color-light-disabled);
  --scrollbar-thumb-color: #444;
  --request-footer-bg: rgb(10 10 10 / 70%);
}

::-webkit-scrollbar {
  width: 0.75rem;
  height: 0.75rem;
}

::-webkit-scrollbar-thumb {
  background-color: var(--scrollbar-thumb-color);
  background-clip: padding-box;
  border: 0.25rem solid transparent;
  border-radius: 10px;
}

body {
  height: 100vh;
  font-family: Sora, sans-serif;
}

#app {
  height: 100%;
  overflow-x: hidden;
}

button {
  height: 40px;

  /* TODO: Brainstrom on managing outlines. https://github.com/arcana-network/wallet-ui/pull/1#discussion_r824371816 */
  cursor: pointer;
  background: transparent;
  outline: none;
}

.font-montserrat {
  font-family: Montserrat, sans-serif;
}

.color-secondary {
  color: var(--color-philippine-gray);
}

.color-state-green {
  color: var(--color-state-green);
}

.color-state-red {
  color: var(--color-state-red);
}

.color-state-yellow {
  color: var(--color-state-yellow);
}

@media (max-width: 235px) {
  button {
    height: 30px;
  }
}

.wallet__container {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding: var(--p-400);
  overflow-x: hidden;
  color: var(--fg-color);
  background: var(--container-bg-color);
}

.flow-container > *:not(:first-child) {
  margin-top: var(--flow-space-container);
}

.flow-element > *:not(:first-child) {
  margin-top: var(--flow-space-element);
}

.v-popper--theme-tooltip {
  background-color: #101010;
}

.v-popper__inner {
  width: 230px;
  height: 110px;
  font-size: var(--fs-300);
  font-weight: 400;
  color: #f9f9f9;
  background-color: #101010;
}
</style>
