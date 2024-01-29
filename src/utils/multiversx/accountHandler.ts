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
    this.privateKey = new UserSecretKey(privateKey)
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

  // the accounts are returned in serialized form
  getAccounts(): string[] {
    return [this.addrStr]
  }

  getBalance() {
    return 0
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

  getTransaction(hash: string): Promise<TransactionOnNetwork> {
    return this.conn.getTransaction(hash)
  }

  async getLatestBlockHash() {
    const s = await this.conn.getNetworkStatus()
    return s.HighestFinalNonce
  }

  get chainType() {
    return ChainType.solana_cv25519
  }
}
