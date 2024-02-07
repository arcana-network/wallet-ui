import { RpcConfig } from '@arcana/auth'
import {
  SignableMessage,
  type ISignature,
  Transaction,
} from '@multiversx/sdk-core'
import {
  ApiNetworkProvider,
  AccountOnNetwork,
} from '@multiversx/sdk-network-providers'
import type { TransactionOnNetwork } from '@multiversx/sdk-network-providers/out'
import { UserSecretKey, UserPublicKey } from '@multiversx/sdk-wallet'
import { Signature } from '@multiversx/sdk-wallet/out/signature'

import { ChainType } from '@/utils/chainType'

export class MultiversXAccountHandler {
  private privateKey: UserSecretKey
  private publicKey: UserPublicKey
  private conn: ApiNetworkProvider
  private rpcConfig!: RpcConfig
  public readonly addrStr: string

  constructor(privateKey: Uint8Array | Buffer, rpcURL: string) {
    this.privateKey = new UserSecretKey(privateKey.subarray(0, -32))
    this.publicKey = this.privateKey.generatePublicKey()
    this.addrStr = this.publicKey.toAddress().toString()
    this.conn = new ApiNetworkProvider(rpcURL)
  }

  get decimals() {
    return 18
  }

  get gasDecimals() {
    return 9
  }

  async getAccountOnNetwork(): Promise<AccountOnNetwork> {
    return this.conn.getAccount(this.publicKey.toAddress())
  }

  async getBalance() {
    const account = await this.conn.getAccount(this.publicKey.toAddress())
    return Number(account.balance)
  }

  async getFungibleTokens() {
    return await this.conn.getFungibleTokensOfAccount(
      this.publicKey.toAddress()
    )
  }

  async getAccountNonce() {
    const account = await this.conn.getAccount(this.publicKey.toAddress())
    return account.nonce
  }

  getNetworkProvider() {
    return this.conn
  }

  getPublicKey(params: Array<unknown>): any {
    if (this.addrStr === params[0]) {
      return this.publicKey.hex()
    } else {
      throw new Error('No Wallet found for the provided address')
    }
  }

  // the accounts are returned in serialized form
  getAccounts(): string[] {
    return [this.addrStr]
  }

  getAccount() {
    return {
      address: this.addrStr,
      publicKey: this.publicKey,
    }
  }

  async setRpcConfig(rpcConfig: RpcConfig) {
    this.rpcConfig = rpcConfig
    this.conn = new ApiNetworkProvider(rpcConfig.rpcUrls[0])
  }

  getChainId() {
    return this.rpcConfig.chainId
  }

  signTransactions(txes: Transaction[]): Transaction[] {
    return txes.map((tx) => {
      const sig = this.privateKey.sign(tx.serializeForSigning())
      tx.applySignature(sig)
      return tx
    })
  }

  signMessage(signableMessage: SignableMessage): ISignature {
    return new Signature(
      this.privateKey.sign(signableMessage.serializeForSigning())
    )
  }

  async broadcastTransaction(tx) {
    return await this.conn.sendTransaction(tx)
  }

  getTransaction(hash: string): Promise<TransactionOnNetwork> {
    return this.conn.getTransaction(hash)
  }

  async getLatestBlockHash() {
    const s = await this.conn.getNetworkStatus()
    return s.HighestFinalNonce
  }

  get chainType() {
    return ChainType.multiversx_cv25519
  }
}
