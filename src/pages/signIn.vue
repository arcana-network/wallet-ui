<script setup>
import OauthLogin from "@/components/oauthLogin.vue";
import { getAuthProvider } from "@/utils/getAuthProvider";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const {
  params: { appId },
} = route;

const authProvider = getAuthProvider(`${appId}`);

async function onClickOfOauth(type) {
  if (!authProvider.isLoggedIn()) {
    const availableLogins = await authProvider.getAvailableLogins();
    if (!availableLogins.includes(type)) {
      alert("Chosen login is not configured");
    }
    await authProvider.loginWithSocial(type);
    router.push("/home");
  }
}
</script>

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
      <OauthLogin @oauthClick="onClickOfOauth" />
      <p class="wallet_signin-signup-text">
        New to Arcana? <button class="wallet_signin-signup-cta">Sign Up</button>
      </p>
    </div>
  </div>
</template>

<style scoped>
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
  justify-content: space-between;
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
}

.wallet_signin-desc {
  font-weight: 400;
  font-size: 14px;
  text-align: center;
}

.wallet_signin-input_container {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 30px;
}

.wallet_signin-input_label {
  font-weight: 400;
  font-size: 14px;
  margin-left: 15px;
  margin-bottom: 10px;
}

.wallet_signin-input_field {
  height: 45px;
  padding: 0px 16px;
  border: none;
  background: var(--debossed-box-color);
  box-shadow: var(--debossed-shadow);
  border-radius: 10px;
  font-weight: 400;
  font-size: 14px;
}

.wallet_signin-button {
  width: 100%;
  height: 40px;
  background: var(--filled-button-bg-color);
  border-radius: 10px;
  color: var(--filled-button-fg-color);
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
}

.wallet_signin-button:hover {
  transform: scale(1.05, 1.15);
  transition: all 0.5s;
}

.wallet_signin-signup-text {
  font-weight: 600;
  font-size: 12px;
}

.wallet_signin-signup-cta {
  font-weight: bold;
  font-size: 12px;
  text-decoration-line: underline;
  text-transform: uppercase;
  color: var(--fg-color);
}
</style>
