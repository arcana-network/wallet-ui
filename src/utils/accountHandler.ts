import { Transaction } from '@ethereumjs/tx'
import { cipher, decryptWithPrivateKey } from 'eth-crypto'
import {
  concatSig,
  personalSign,
  signTypedData_v4 as signTypedDataV4,
} from 'eth-sig-util'
import {
  stripHexPrefix,
  ecsign,
  BN,
  bufferToHex,
  setLengthLeft,
} from 'ethereumjs-util'
import { ethers } from 'ethers'

export class AccountHandler {
  wallet: ethers.Wallet
  provider: ethers.providers.JsonRpcProvider

  constructor(privateKey: string) {
    this.wallet = new ethers.Wallet(privateKey)
    this.provider = new ethers.providers.JsonRpcProvider(
      process.env.VUE_APP_WALLET_RPC_URL
    )
  }

  getAccount(): { address: string; publicKey: string } {
    const { address, publicKey } = this.wallet
    return { address, publicKey }
  }

  getAccounts(): string[] {
    return [this.wallet.address]
  }

  getWallet(address: string): ethers.Wallet | undefined {
    if (this.wallet.address.toUpperCase() === address.toUpperCase()) {
      return this.wallet
    }
    return undefined
  }

  async getChainId() {
    if (this.provider.network) return this.provider.network.chainId
    return (await this.provider.detectNetwork()).chainId
  }

  getPublicKey(address: string): string {
    const wallet = this.getWallet(address)
    if (wallet) {
      return this.wallet.publicKey
    } else {
      throw new Error('No Wallet found for the provided address')
    }
  }

  async requestSign(address: string, msg: string): Promise<string> {
    try {
      const wallet = this.getWallet(address)
      if (wallet) {
        const signature = ecsign(
          setLengthLeft(Buffer.from(stripHexPrefix(msg), 'hex'), 32),
          Buffer.from(stripHexPrefix(wallet.privateKey), 'hex')
        )
        const rawMessageSig = concatSig(
          signature.v as unknown as Buffer,
          signature.r,
          signature.s
        )
        return rawMessageSig
      } else {
        throw new Error('No Wallet found for the provided address')
      }
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async requestPersonalSign(address: string, msg: string) {
    try {
      const wallet = this.getWallet(address)
      if (wallet) {
        const signature = personalSign(
          Buffer.from(stripHexPrefix(wallet.privateKey), 'hex'),
          { data: msg }
        )
        return signature
      } else {
        throw new Error('No Wallet found for the provided address')
      }
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async requestSendTransaction(data, address: string) {
    try {
      const wallet = this.getWallet(address)
      if (wallet) {
        const signer = wallet.connect(this.provider)
        const tx = await signer.sendTransaction(data)
        return tx.hash
      } else {
        throw new Error('No Wallet found for the provided address')
      }
    } catch (e) {
      return e
    }
  }

  async requestDecryption(ciphertext: string, address: string) {
    try {
      const wallet = this.getWallet(address)
      if (wallet) {
        const parsedCipher = cipher.parse(ciphertext)
        const decryptedMessage = await decryptWithPrivateKey(
          wallet.privateKey,
          parsedCipher
        )
        return decryptedMessage
      } else {
        throw new Error('No Wallet found for the provided address')
      }
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async requestSignTransaction(txData, address: string) {
    try {
      const wallet = this.getWallet(address)
      if (wallet) {
        const transaction = Transaction.fromTxData({
          ...txData,
          value: new BN(txData.value, 10),
          gasPrice: new BN(txData.gasPrice, 10),
          gas: new BN(txData.gas, 10),
        })
        const tx = transaction.sign(
          Buffer.from(stripHexPrefix(wallet.privateKey), 'hex')
        )
        const raw = bufferToHex(tx.serialize())
        return { raw, tx: tx.toJSON() }
      } else {
        throw new Error('No Wallet found for the provided address')
      }
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async requestSignTypedMessage(data, address: string) {
    const wallet = this.getWallet(address)
    if (wallet) {
      const parsedData = JSON.parse(data)
      const signature = signTypedDataV4(
        Buffer.from(stripHexPrefix(wallet.privateKey), 'hex'),
        { data: parsedData }
      )
      return signature
    } else {
      throw new Error('No Wallet found for the provided address')
    }
  }
}
