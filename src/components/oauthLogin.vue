<template>
  <div class="wallet_signin-oauth-container">
    <p class="wallet_signin-oauth-text">Or sign in with</p>
    <button>
      <img
        class="wallet_signin-oauth-icon"
        src="../assets/images/google_icon.png"
      />
    </button>
    <button>
      <img
        class="wallet_signin-oauth-icon"
        src="../assets/images/twitter_icon.png"
      />
    </button>
    <button>
      <img
        class="wallet_signin-oauth-icon"
        src="../assets/images/github_icon.png"
      />
    </button>
  </div>
</template>

<script>
export default {
  name: "oAuthLogin",
};
</script>

<style scoped>
.wallet_signin-oauth-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 200px;
}

.wallet_signin-oauth-text {
  font-size: 10px;
  font-weight: 400;
}

.wallet_signin-oauth-icon {
  width: 24px;
  height: 24px;
}
</style>
