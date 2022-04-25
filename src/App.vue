<script setup lang="ts">
import { connectToParent } from 'penpal'
import { toRefs, watch } from 'vue'
import { useRouter } from 'vue-router'

import WalletFooter from '@/components/AppFooter.vue'
import type { ParentConnectionApi } from '@/models/Connection'
import { useAppStore } from '@/store/app'
import { useUserStore } from '@/store/user'
import { getAuthProvider } from '@/utils/getAuthProvider'

const user = useUserStore()
const app = useAppStore()
const { theme } = toRefs(app)
const router = useRouter()

const connectionWithoutLogin = connectToParent<ParentConnectionApi>({
  methods: {
    isLoggedIn: () => user.isLoggedIn,
    triggerLogin: handleLoginRequest,
  },
})

async function handleLoginRequest(type) {
  const authProvider = getAuthProvider(`${app.id}`)
  try {
    await user.handleLogin(authProvider, type)
    router.push('/')
  } catch (error) {
    console.log(error)
    user.$reset() // resets user store if login fails
  }
}

async function getAppTheme() {
  const connectionInstance = await connectionWithoutLogin.promise
  const { theme } = await connectionInstance.getThemeConfig()
  app.setTheme(theme)
}

watch(
  () => user.isLoggedIn,
  (isLoggedIn) => {
    if (isLoggedIn) {
      connectionWithoutLogin.destroy()
    }
  }
)

getAppTheme()
</script>

<template>
  <div
    class="wallet__container"
    :class="[theme === 'dark' ? 'dark-mode' : 'light-mode']"
  >
    <div class="wallet__body">
      <RouterView />
    </div>
    <WalletFooter />
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@100;400;600;700&display=block');
@import '@/assets/css/reset.css';

:root {
  --color-light: #f9f9f9;
  --color-dark: #101010;
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
  --debossed-light-color: #eeeeee;
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
  --bg-gradient: var(--color-gradient-light);
  --content-bg-color: var(--color-light);
  --container-bg-color: var(--color-gradient-light);
  --debossed-box-color: var(--debossed-light-color);
  --debossed-shadow: var(--debossed-box-shadow-light);
  --filled-button-bg-color: var(--color-dark);
  --filled-button-fg-color: var(--color-light);
  --outlined-button-border-color: var(--color-dark);
  --outlined-button-fg-color: var(--color-dark);
}

.dark-mode {
  --fg-color: var(--color-light);
  --bg-gradient: var(--color-gradient-dark);
  --content-bg-color: var(--color-gradient-dark);
  --container-bg-color: var(--color-dark);
  --debossed-box-color: var(--debossed-dark-color);
  --debossed-shadow: var(--debossed-box-shadow-dark);
  --filled-button-bg-color: var(--color-light);
  --filled-button-fg-color: var(--color-dark);
  --outlined-button-border-color: var(--color-light);
  --outlined-button-fg-color: var(--color-light);
}

body {
  font-family: Sora, sans-serif;
  height: 100vh;
}

#app {
  height: 100%;
}

button {
  /* TODO: Brainstrom on managing outlines. https://github.com/arcana-network/wallet-ui/pull/1#discussion_r824371816 */
  cursor: pointer;
  background: transparent;
  border: none;
  outline: none;
  height: 40px;
}

@media (max-width: 235px) {
  button {
    height: 30px;
  }
}

.flow-container > *:not(:first-child) {
  margin-top: var(--flow-space-container);
}

.flow-element > *:not(:first-child) {
  margin-top: var(--flow-space-element);
}

.wallet__container {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  height: 100%;
  padding: var(--p-400);
  color: var(--fg-color);
  background: var(--container-bg-color);
  overflow: hidden;
}

.wallet__container > * + * {
  margin-top: 10px;
}

.wallet__body {
  flex: 1;
  background: var(--content-bg-color);
  border-radius: 10px;
  box-shadow: 4px 5px 4px rgb(0 0 0 / 25%);
  overflow: auto;
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
