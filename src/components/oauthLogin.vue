<script setup></script>

<template>
  <div class="wallet_signin-oauth-container">
    <p class="wallet_signin-oauth-text">Or sign in with</p>
    <button>
      <img
        class="wallet_signin-oauth-icon"
        src="../assets/images/google-icon.png"
      />
    </button>
    <button>
      <img
        class="wallet_signin-oauth-icon"
        src="../assets/images/twitter-icon.png"
      />
    </button>
    <!--Todo: use theme var to change github icon (dark or light) -->
    <button>
      <img
        class="wallet_signin-oauth-icon"
        src="../assets/images/github-icon.png"
      />
    </button>
  </div>
</template>

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
