<template>
  <div class="wallet_container">
    <div class="wallet_body">
      <SignMessage />
    </div>
    <WalletFooter />
  </div>
</template>

<script>
import "modern-css-reset";

import WalletFooter from "./components/footer.vue";
// import SignIn from "./pages/signIn.vue";
import SignMessage from "./pages/signMessage.vue";

export default {
  name: "App",
  components: { /* SignIn, */ SignMessage, WalletFooter },
};
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Sora:wght@100;400;600;700&display=swap");

body {
  font-family: "Sora", sans-serif;
}

.wallet_container {
  width: 360px;
  height: 488px;
  padding: 16px;

  display: flex;
  flex-direction: column;
  justify-content: space-around;

  background: linear-gradient(
    324.81deg,
    #d6d8d9 14.65%,
    rgba(232, 232, 232, 0.36) 92.36%
  );
}

.wallet_body {
  width: 328px;
  height: 402px;
  margin: 0 auto;

  background: #f9f9f9;
  box-shadow: 4px 5px 4px rgba(0, 0, 0, 0.25);
  border-radius: 10px;
}
</style>
