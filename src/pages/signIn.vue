<template>
  <div class="wallet_signin-container">
    <p class="wallet_signin-title">Welcome</p>
    <p class="wallet_signin-desc">
      We’ll email you a magic link for a password-free sign in.
    </p>
    <div class="wallet_signin-input_container">
      <label class="wallet_signin-input_label">Email</label>
      <input
        class="wallet_signin-input_field"
        placeholder="someone@example.com"
      />
    </div>
    <button class="wallet_signin-button">Send magic link</button>
    <p class="wallet_signin-signup-text">
      New to Arcana? <button class="wallet_signin-signup-cta">Sign Up</button>
    </p>
  </div>
</template>

<script>
export default {
  name: "SignIn",
};
</script>

<style>
.wallet_signin-container {
  padding: 20px 15px;
}

.wallet_signin-title {
  font-family: Sora;
  font-style: normal;
  font-weight: 600;
  font-size: 20px;
  line-height: 25px;

  text-align: center;
  color: #101010;
}

.wallet_signin-desc {
  font-family: Sora;
  font-style: normal;
  font-weight: normal;
  font-size: 16px;
  line-height: 18px;
  text-align: center;

  color: #101010;
}

.wallet_signin-input_container {
  display: flex;
  flex-direction: column;
}

.wallet_signin-input_label {
  font-style: normal;
  font-weight: normal;
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

  font-family: Sora;
  font-style: normal;
  font-weight: normal;
  font-size: 20px;
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
  margin-top: 28px;

  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 18px;
  text-transform: uppercase;
}

.wallet_signin-signup-text {
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 150%;
  text-align: center;
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
