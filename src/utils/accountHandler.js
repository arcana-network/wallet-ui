import { ethers } from "ethers";
import {
  stripHexPrefix,
  privateToPublic,
  ecsign,
  setLengthLeft,
} from "ethereumjs-util";
import { concatSig } from "eth-sig-util";

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

  getPublicKey(address) {
    const wallet = this.getWallet(address);
    const pub = privateToPublic(
      Buffer.from(stripHexPrefix(wallet.privateKey), "hex")
    );
    return pub.toString("hex");
  }

  async requestSign(address, msg) {
    try {
      const wallet = this.getWallet(address);
      const signature = ecsign(
        setLengthLeft(Buffer.from(stripHexPrefix(msg), "hex"), 32),
        Buffer.from(stripHexPrefix(wallet.privateKey), "hex")
      );
      const rawMessageSig = concatSig(signature.v, signature.r, signature.s);
      return rawMessageSig;
    } catch (e) {
      console.log({ e });
      return Promise.reject(e);
    }
  }
}
