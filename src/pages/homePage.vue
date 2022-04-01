<script setup>
import { connectToParent } from "penpal";
import { getSendRequestFn, handleRequest } from "@/utils/requestManagement";
import { Keeper } from "@/utils/keeper";
import { permissions } from "@/utils/callPermissionsConfig";
import { getWalletType } from "@/utils/getwalletType";
import { AccountHandler } from "@/utils/accountHandler";
import { useUserStore } from "@/store/user";
import { useAppStore } from "@/store/app";
import { useRouter } from "vue-router";
import { useRequestStore } from "@/store/request";

const user = useUserStore();
const app = useAppStore();
const requestStore = useRequestStore();
const router = useRouter();

const { privateKey } = user;
const { email, name, picture } = user.info;
const { id: appId } = app;

async function connectionToParent() {
  const walletType = await getWalletType(appId);
  const accountHandler = new AccountHandler(privateKey);
  const keeper = new Keeper(
    privateKey,
    permissions,
    walletType,
    accountHandler
  );

  const sendRequest = getSendRequestFn(
    handleRequest,
    keeper,
    router,
    requestStore
  );
  const connectionInstance = await connectToParent({
    methods: {
      sendRequest,
    },
  }).promise;
  keeper.setConnection(connectionInstance);
}

connectionToParent();
</script>

<template>
  <div class="wallet_home-container">
    <img :src="picture" alt="user image" class="wallet_picture" />
    <p class="wallet_name">
      Name: <span>{{ name }}</span>
    </p>
    <p class="wallet_email">
      Email: <span>{{ email }}</span>
    </p>
  </div>
</template>

<style>
.wallet_home-container {
  height: 100%;
  padding: 20px 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.wallet_picture {
  border-radius: 50%;
  margin-bottom: 10px;
}

.wallet_name {
  margin-bottom: 10px;
}

.wallet_email {
}
</style>
