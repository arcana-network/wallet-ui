<template>
  <div class="wallet_signin-container">
    <div class="wallet_signin-body">
      <div class="wallet_signin_title-desc">
        <h1 class="wallet_signin-title">Welcome</h1>
        <p class="wallet_signin-desc">
          We’ll email you a magic link for a password-free sign in.
        </p>
      </div>
      <div class="wallet_signin-input_container">
        <label class="wallet_signin-input_label">Email</label>
        <input
          class="wallet_signin-input_field"
          placeholder="someone@example.com"
        />
      </div>
      <button class="wallet_signin-button">Send magic link</button>
    </div>
    <div class="wallet_signin-footer">
      <oAuthLogin />
      <p class="wallet_signin-signup-text">
        New to Arcana? <button class="wallet_signin-signup-cta">Sign Up</button>
      </p>
    </div>
  </div>
</template>

<script>
import oAuthLogin from "../components/oauthLogin.vue";

export default {
  name: "SignIn",
  components: {
    oAuthLogin,
  },
};
</script>

<style>
.wallet_signin-container {
  height: 100%;
  padding: 20px 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}

.wallet_signin-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.wallet_signin-footer {
  width: 100%;
  height: 62px;
  margin-top: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.wallet_signin_title-desc {
  height: 76px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.wallet_signin-title {
  font-weight: 600;
  font-size: 20px;
  text-align: center;
  color: #101010;
}

.wallet_signin-desc {
  font-size: 14px;
  text-align: center;
  color: #101010;
}

.wallet_signin-input_container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.wallet_signin-input_label {
  font-size: 14px;
  color: #101010;
}

.wallet_signin-input_field {
  height: 45px;
  margin: 10px 0px;
  padding: 0px 16px;
  background: #eeeeee;
  box-shadow: inset -1px -1px 1px rgba(255, 255, 255, 0.7),
    inset 1px 1px 2px rgba(174, 174, 192, 0.2);
  border-radius: 10px;
  font-size: 14px;
  color: #101010;
}

.wallet_signin-button {
  width: 100%;
  height: 38px;
  color: #f7f7f7;
  background: #101010;
  border-radius: 10px;
  border: none;
  outline: none;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
}

.wallet_signin-signup-text {
  font-weight: 600;
  font-size: 12px;
}

.wallet_signin-signup-cta {
  background: transparent;
  border: none;
  outline: none;
  font-weight: bold;
  font-size: 12px;
  text-decoration-line: underline;
  text-transform: uppercase;
}
</style>
