<template>
  <div class="wallet_container">
    <div class="wallet_body">
      <SignMessage />
    </div>
    <WalletFooter />
  </div>
</template>

<script>
import "@/assets/css/reset.css";

import WalletFooter from "@/components/footer.vue";
import SignIn from "@/pages/signIn.vue";
// import SignMessage from "@/pages/signMessage.vue";

export default {
  name: "App",
  components: { /* SignIn, */ SignMessage, WalletFooter },
};
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Sora:wght@100;400;600;700&display=block");

:root {
  --color: #101010;
  --bg-color: linear-gradient(
    324.81deg,
    #d6d8d9 14.65%,
    rgba(232, 232, 232, 0.36) 92.36%
  );
  --content-bg-color: #f9f9f9;
  --filled-button-bg-color: #101010;
  --filled-button-fg-color: #f7f7f7;
  --outlined-button-border-color: #101010;
  --outlined-button-fg-color: #101010;
  --input-box-bg-color: #eeeeee;
  --input-box-box-shadow: inset -1px -1px 1px rgba(255, 255, 255, 0.7),
    inset 1px 1px 2px rgba(174, 174, 192, 0.2);
}

.dark-mode {
  --color: #f7f7f7;
  --bg-color: #0f0908;
  --content-bg-color: radial-gradient(
    134.5% 939.99% at -23.59% -12.9%,
    #262626 0%,
    #1a1a1a 31.41%,
    rgba(32, 32, 32, 0.76) 100%
  );
  --filled-button-bg-color: #f7f7f7;
  --filled-button-fg-color: #101010;
  --outlined-button-border-color: #f7f7f7;
  --outlined-button-fg-color: #f7f7f7;
  --input-box-bg-color: linear-gradient(
    141.48deg,
    #161616 -4.56%,
    #151515 135.63%
  );
  --input-box-box-shadow: inset -2px -2px 4px rgba(57, 57, 57, 0.44),
    inset 5px 5px 10px rgba(11, 11, 11, 0.5);
}

body {
  font-family: "Sora", sans-serif;
  line-height: 1.5;
}

button {
  cursor: pointer;
  border: none;
  outline: none;
  background: transparent;
}

.wallet_container {
  width: 360px;
  height: 490px;
  padding: 16px;

  color: var(--color);

  display: flex;
  flex-direction: column;
  justify-content: space-around;

  background: var(--bg-color);
}

.wallet_body {
  width: 330px;
  height: 400px;
  margin: 0 auto;

  background: var(--content-bg-color);
  box-shadow: 4px 5px 4px rgba(0, 0, 0, 0.25);
  border-radius: 10px;
}
</style>
