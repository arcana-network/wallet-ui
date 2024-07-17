import { RpcConfig } from '@arcana/auth'
import {
  SignableMessage,
  type ISignature,
  Transaction,
  TransferTransactionsFactory,
  GasEstimator,
  TokenTransfer,
  Address,
  IPlainTransactionObject,
} from '@multiversx/sdk-core'
import {
  ApiNetworkProvider,
  AccountOnNetwork,
} from '@multiversx/sdk-network-providers'
import type { TransactionOnNetwork } from '@multiversx/sdk-network-providers/out'
import { UserSecretKey, UserPublicKey } from '@multiversx/sdk-wallet'
import { Signature } from '@multiversx/sdk-wallet/out/signature'

import { ChainType } from '@/utils/chainType'
import MVXChainIdMap from '@/utils/multiversx/chainIdMap'
import { grindToShard } from '@/utils/multiversx/grind-to-shard'

const requiredShardID = 2

export class MultiversXAccountHandler {
  private privateKey: UserSecretKey
  private readonly publicKey: UserPublicKey
  private conn: ApiNetworkProvider
  private rpcConfig!: RpcConfig
  public readonly addrStr: string

  constructor(privateKey: Buffer, rpcURL: string) {
    const realPK = grindToShard(privateKey, requiredShardID)
    this.privateKey = new UserSecretKey(realPK.subarray(0, -32))
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

  async getTransactionObjectNFT(collection, nonce, sender, reeciever, chainID) {
    const factory = new TransferTransactionsFactory(new GasEstimator())
    const transfer = TokenTransfer.nonFungible(collection, nonce)

    return factory.createESDTNFTTransfer({
      tokenTransfer: transfer,
      nonce: await this.getAccountNonce(),
      sender: new Address(sender),
      destination: new Address(reeciever),
      chainID: MVXChainIdMap[chainID],
    })
  }

  async getTransactionObjectNativeToken(
    sender,
    reeciever,
    value,
    chainID,
    gasLimit
  ) {
    const transaction = {
      sender: sender,
      receiver: reeciever,
      value: value,
      chainID: MVXChainIdMap[chainID],
      version: 1,
    } as IPlainTransactionObject

    const txObject = Transaction.fromPlainObject(transaction)
    txObject.setNonce(await this.getAccountNonce())
    txObject.setValue(TokenTransfer.egldFromAmount(value))
    txObject.setGasLimit(gasLimit)
    return txObject
  }

  async getTransactionObjectESDTToken(
    sender,
    receiver,
    value,
    tokenInfo,
    chainID
  ) {
    const factory = new TransferTransactionsFactory(new GasEstimator())

    const transfer = TokenTransfer.fungibleFromAmount(
      tokenInfo.symbol,
      value,
      tokenInfo.decimals
    )

    const txObject = factory.createESDTTransfer({
      tokenTransfer: transfer,
      nonce: await this.getAccountNonce(),
      sender: new Address(sender),
      receiver: new Address(receiver),
      chainID: MVXChainIdMap[chainID],
    })

    return txObject
  }

  async sendToken(txObject) {
    const tx = this.signTransactions([txObject])
    return await this.broadcastTransaction(tx[0])
  }

  async getLatestBlockHash() {
    const s = await this.conn.getNetworkStatus()
    return s.HighestFinalNonce
  }

  get chainType() {
    return ChainType.multiversx_cv25519
  }
}
