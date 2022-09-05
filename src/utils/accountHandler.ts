import Common from '@ethereumjs/common'
import { Transaction, TxData } from '@ethereumjs/tx'
import { cipher, decryptWithPrivateKey } from 'eth-crypto'
import {
  concatSig,
  personalSign,
  signTypedData_v4 as signTypedDataV4,
} from 'eth-sig-util'
import {
  stripHexPrefix,
  ecsign,
  bufferToHex,
  setLengthLeft,
} from 'ethereumjs-util'
import { ethers } from 'ethers'

interface TransactionData extends TxData {
  from: string
}

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

  async requestSendTransaction(data: TransactionData) {
    try {
      const wallet = this.getWallet(data.from)
      if (wallet) {
        const signature = await this.requestSignTransaction(data)
        const tx = await this.provider.sendTransaction(signature.raw)
        return tx.hash
      } else {
        throw new Error('No Wallet found for the provided address')
      }
    } catch (e) {
      return Promise.reject(e)
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

  async requestSignTransaction(txData: TransactionData) {
    try {
      const wallet = this.getWallet(txData.from)
      if (wallet) {
        const chainId = await this.getChainId()
        const nonce = await this.provider.getTransactionCount(wallet.address)
        const transaction = Transaction.fromTxData(
          {
            nonce,
            ...txData,
            gasLimit: 21000,
          },
          { common: Common.custom({ chainId }) }
        )
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

  async requestSignTypedMessage(data: string, address: string) {
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
