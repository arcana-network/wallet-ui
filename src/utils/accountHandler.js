import { ethers } from "ethers";

export class AccountHandler {
  constructor(privateKey) {
    this.wallets = [];
    this.privateKey = privateKey;
    this.provider = new ethers.providers.JsonRpcProvider(
      process.env.VUE_APP_WALLET_RPCURL
    );
    this.addWallet(privateKey);
  }

  addWallet(privateKey) {
    const wallet = new ethers.Wallet(privateKey);
    if (this.wallets.find((w) => w.address === wallet.address)) {
      return;
    }
    this.wallets.push(wallet);
  }

  getAccounts() {
    return this.wallets.map((w) => w.address);
  }

  getWallet(address) {
    return this.wallets.find(
      (w) => w.address.toUpperCase() === address.toUpperCase()
    );
  }
}
