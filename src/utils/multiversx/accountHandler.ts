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

export class MultiversXAccountHandler {
  private privateKey: UserSecretKey
  private publicKey: UserPublicKey
  private readonly addrStr: string
  private conn: ApiNetworkProvider
  private rpcConfig!: RpcConfig

  constructor(privateKey: Uint8Array | Buffer, rpcURL: string) {
    this.privateKey = new UserSecretKey(privateKey)
    this.publicKey = this.privateKey.generatePublicKey()
    this.addrStr = this.publicKey.toAddress().toString()
    this.conn = new ApiNetworkProvider(rpcURL)
  }

  async getAccountOnNetwork(): Promise<AccountOnNetwork> {
    return this.conn.getAccount(this.publicKey.toAddress())
  }

  // the accounts are returned in serialized form
  getAccounts(): string[] {
    return [this.addrStr]
  }

  async setRpcConfig(rpcConfig: RpcConfig) {
    this.rpcConfig = rpcConfig
    this.conn = new ApiNetworkProvider(rpcConfig.rpcUrls[0])
  }

  getChainId() {
    return this.rpcConfig.chainId
  }

  signTransactions(txes: Transaction[]): Uint8Array[] {
    return txes.map((tx) => this.privateKey.sign(tx.serializeForSigning()))
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
}
