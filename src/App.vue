<script setup lang="ts">
import { toRefs, ref, onMounted } from 'vue'

import WalletFooter from '@/components/AppFooter.vue'
import BaseModal from '@/components/BaseModal.vue'
import { useAppStore } from '@/store/app'
import { useModalStore } from '@/store/modal'
import { useUserStore } from '@/store/user'
import '@/index.css'

const user = useUserStore()
const app = useAppStore()
const modal = useModalStore()
const { theme } = toRefs(app)
const isLoading = ref(false)

onMounted(init)

function setThemeAttribute(value) {
  const htmlEl = document.getElementsByTagName('html')[0]
  if (value === 'dark') htmlEl.classList.add(value)
}

function init() {
  isLoading.value = true
  try {
    const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}')
    const isLoggedIn = sessionStorage.getItem('isLoggedIn')
    const theme = localStorage.getItem('theme')
    const appName = localStorage.getItem('appName')

    if (theme) {
      app.setTheme(theme)
      setThemeAttribute(theme)
    }
    if (appName) app.setName(appName)

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
    class="wallet__container"
    :class="[theme === 'dark' ? 'dark-mode' : 'light-mode']"
  >
    <RouterView />
    <WalletFooter />
    <BaseModal v-if="modal.show" />
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@100;400;600;700&display=block');
@import '@/assets/css/reset.css';

:root {
  --color-light: #f9f9f9;
  --color-dark: #101010;
  --color-philippine-gray: #8d8d8d;
  --color-light-disabled: #f9f9f9af;
  --color-dark-disabled: #101010af;
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
  --debossed-box-shadow-light: inset -1px -1px 1px rgb(255 255 255 / 70%),
    inset 1px 1px 2px rgb(174 174 192 / 20%);
  --debossed-box-shadow-dark: inset -2px -2px 4px rgb(57 57 57 / 44%),
    inset 5px 5px 10px rgb(11 11 11 / 50%);
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
  --container-bg-color: var(--color-gradient-light);
  --debossed-box-color: var(--debossed-light-color);
  --debossed-shadow: var(--debossed-box-shadow-light);
  --filled-button-bg-color: var(--color-dark);
  --filled-button-fg-color: var(--color-light);
  --outlined-button-border-color: var(--color-dark);
  --outlined-button-fg-color: var(--color-dark);
  --button-bg-disabled: var(--color-dark-disabled);
}

.dark-mode {
  --fg-color: var(--color-light);
  --fg-color-secondary: var(--color-philippine-gray);
  --bg-gradient: var(--color-gradient-dark);
  --content-bg-color: var(--color-gradient-dark);
  --container-bg-color: var(--color-dark);
  --debossed-box-color: var(--debossed-dark-color);
  --debossed-shadow: var(--debossed-box-shadow-dark);
  --filled-button-bg-color: var(--color-light);
  --filled-button-fg-color: var(--color-dark);
  --outlined-button-border-color: var(--color-light);
  --outlined-button-fg-color: var(--color-light);
  --button-bg-disabled: var(--color-light-disabled);
}

body {
  height: 100vh;
  font-family: Sora, sans-serif;
}

#app {
  height: 100%;
}

button {
  height: 40px;

  /* TODO: Brainstrom on managing outlines. https://github.com/arcana-network/wallet-ui/pull/1#discussion_r824371816 */
  cursor: pointer;
  background: transparent;
  outline: none;
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
  min-height: 100%;
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

.wallet__body {
  flex: 1;
  overflow: auto;
  background: var(--content-bg-color);
  border-radius: 10px;
  box-shadow: 4px 5px 4px rgb(0 0 0 / 25%);
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
