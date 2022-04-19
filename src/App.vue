<script setup>
import '@/assets/css/reset.css'

import { connectToParent } from 'penpal'
import { toRefs, watch } from 'vue'

import WalletFooter from '@/components/AppFooter.vue'
import { useAppStore } from '@/store/app'
import { useUserStore } from '@/store/user'

const user = useUserStore()
const app = useAppStore()
const { theme } = toRefs(app)

const connectionWithoutLogin = connectToParent({
  methods: {
    isLoggedIn: () => user.isLoggedIn,
  },
})

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
    class="wallet_container"
    :class="[theme === 'dark' ? 'dark-mode' : 'light-mode']"
  >
    <div class="wallet_body">
      <RouterView />
    </div>
    <WalletFooter />
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@100;400;600;700&display=block');

:root {
  --color-light: #f9f9f9;
  --color-dark: #101010;
  --color-gradient-light: linear-gradient(
    324.81deg,
    #d6d8d9 14.65%,
    rgba(232, 232, 232, 0.36) 92.36%
  );
  --color-gradient-dark: radial-gradient(
    134.5% 939.99% at -23.59% -12.9%,
    #262626 0%,
    #1a1a1a 31.41%,
    rgba(32, 32, 32, 0.76) 100%
  );
  --box-shadow-light: inset -1px -1px 1px rgba(255, 255, 255, 0.7),
    inset 1px 1px 2px rgba(174, 174, 192, 0.2);
  --box-shadow-dark: inset -2px -2px 4px rgba(57, 57, 57, 0.44),
    inset 5px 5px 10px rgba(11, 11, 11, 0.5);
  --debossed-light-color: #eeeeee;
  --debossed-dark-color: #161616;
  --debossed-box-shadow-light: inset -1px -1px 1px rgba(255, 255, 255, 0.7),
    inset 1px 1px 2px rgba(174, 174, 192, 0.2);
  --debossed-box-shadow-dark: inset -2px -2px 4px rgba(57, 57, 57, 0.44),
    inset 5px 5px 10px rgba(11, 11, 11, 0.5);
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
  font-family: 'Sora', sans-serif;
  line-height: 1.5;
}

button {
  /*TODO: Brainstrom on managing outlines. https://github.com/arcana-network/wallet-ui/pull/1#discussion_r824371816 */
  cursor: pointer;
  border: none;
  outline: none;
  background: transparent;
}

.wallet_container {
  width: 360px;
  height: 490px;
  padding: 16px;

  color: var(--fg-color);

  display: flex;
  flex-direction: column;
  justify-content: space-around;

  background: var(--container-bg-color);
}

.wallet_body {
  width: 330px;
  height: 400px;
  margin: 0 auto;

  background: var(--content-bg-color);
  box-shadow: 4px 5px 4px rgba(0, 0, 0, 0.25);
  border-radius: 10px;
}

.v-popper--theme-tooltip {
  background-color: #101010;
}

.v-popper__inner {
  width: 230px;
  height: 110px;
  font-weight: 400;
  font-size: 10px;
  background-color: #101010;
  color: #f9f9f9;
}
</style>
