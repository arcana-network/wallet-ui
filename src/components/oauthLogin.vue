<template>
  <div class="wallet_signin-oauth-container">
    <p class="wallet_signin-oauth-text">sign in with</p>
    <img
      class="wallet_signin-oauth-icon"
      src="../assets/images/google_icon.png"
    />
    <img
      class="wallet_signin-oauth-icon"
      src="../assets/images/twitter_icon.png"
    />
    <img
      class="wallet_signin-oauth-icon"
      src="../assets/images/github_icon.png"
    />
  </div>
</template>

<script>
export default {
  name: "oAuthLogin",
};
</script>

<style>
.wallet_signin-oauth-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 200px;
}

.wallet_signin-oauth-text {
  font-size: 10px;
}

.wallet_signin-oauth-icon {
  width: 24px;
  height: 24px;
}
</style>
