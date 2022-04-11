import { ethers } from "ethers";
import {
  stripHexPrefix,
  privateToPublic,
  ecsign,
  setLengthLeft,
  BN,
  bufferToHex,
} from "ethereumjs-util";
import {
  concatSig,
  personalSign,
  signTypedData_v4 as signTypedDataV4,
} from "eth-sig-util";
import { cipher, decryptWithPrivateKey } from "eth-crypto";
import { Transaction } from "@ethereumjs/tx";

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

  async requestPersonalSign(address, msg) {
    try {
      const wallet = this.getWallet(address);
      const signature = personalSign(
        setLengthLeft(Buffer.from(stripHexPrefix(msg), "utf8"), 32),
        Buffer.from(stripHexPrefix(wallet.privateKey), "hex")
      );
      return signature;
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async requestSendTransaction(data, address) {
    const wallet = this.getWallet(address);
    const signer = wallet.connect(this.provider);
    const tx = await signer.sendTransaction(data);
    return tx.hash;
  }

  async requestDecryption(ciphertext, address) {
    try {
      const wallet = this.getWallet(address);
      const parsedCipher = cipher.parse(ciphertext);
      const decryptedMessage = await decryptWithPrivateKey(
        wallet.privateKey,
        parsedCipher
      );
      return decryptedMessage;
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async requestSignTransaction(txData, address) {
    try {
      const wallet = this.getWallet(address);
      const transaction = Transaction.fromTxData(
        {
          ...txData,
          value: new BN(txData.value, 10),
          gasPrice: new BN(txData.gasPrice, 10),
          gas: new BN(txData.gas, 10),
        },
        { chainId: this.provider.network.chainId }
      );
      const tx = transaction.sign(
        Buffer.from(stripHexPrefix(wallet.privateKey), "hex")
      );
      const raw = bufferToHex(tx.serialize());
      return { raw, tx: tx.toJSON() };
    } catch (e) {
      console.log({ e });
      return Promise.reject(e);
    }
  }

  async requestSignTypedMessage(data, address) {
    const wallet = this.getWallet(address);

    const parsedData = JSON.parse(data);
    console.log({ parsedData });
    const signature = signTypedDataV4(
      Buffer.from(stripHexPrefix(wallet.privateKey), "hex"),
      { data: parsedData }
    );
    return signature;
  }
}
