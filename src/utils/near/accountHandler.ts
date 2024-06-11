import {
  type Account,
  connect,
  keyStores,
  type Near,
  utils,
  transactions,
} from 'near-api-js'

import { ChainType } from '@/utils/chainType'
import { devLogger } from '@/utils/devLogger'

export class NEARAccountHandler {
  private keystore = new keyStores.InMemoryKeyStore()
  private readonly kp: utils.KeyPairEd25519
  private privateKey: string // should be binary
  private readonly implicitAccountID: string
  private connection: Near | null = null
  private account: Account | null = null

  constructor(privateKey: string) {
    this.privateKey = privateKey
    this.kp = new utils.KeyPairEd25519(this.privateKey)
    this.implicitAccountID = Buffer.from(this.kp.publicKey.data).toString('hex')

    // how do we handle this?
    this.keystore.setKey('default', this.implicitAccountID, this.kp)
  }

  get chainType() {
    return ChainType.near_cv25519
  }

  get decimals() {
    return 24
  }

  get gasDecimals() {
    return 9
  }

  async initializeConnection(rpcURL: string) {
    this.connection = await connect({
      networkId: 'default',
      keyStore: this.keystore,
      nodeUrl: rpcURL,
      walletUrl: 'https://localhost',
      helperUrl: 'https://localhost',
    })
    this.account = await this.connection.account(this.implicitAccountID)
  }

  // ???
  assertAccount() {
    if (this.account == null) {
      throw new Error('account required but not initialized')
    }
    return this.account
  }

  getAccounts() {
    return Promise.resolve([this.implicitAccountID])
  }

  getAccount() {
    return {
      address: this.implicitAccountID,
    }
  }

  async getBalance() {
    try {
      const bObj = await this.assertAccount().getAccountBalance()
      return BigInt(bObj.available) < BigInt(0)
        ? BigInt(0)
        : BigInt(bObj.available)
    } catch (e) {
      return BigInt(0)
    }
  }

  async getBalanceBreakdown() {
    try {
      const bObj = await this.assertAccount().getAccountBalance()
      return {
        total: BigInt(bObj.total) < BigInt(0) ? BigInt(0) : BigInt(bObj.total),
        available:
          BigInt(bObj.available) < BigInt(0)
            ? BigInt(0)
            : BigInt(bObj.available),
        locked: BigInt(bObj.stateStaked),
        staked: BigInt(bObj.staked),
      }
    } catch (e) {
      return {
        total: BigInt(0),
        available: BigInt(0),
        locked: BigInt(0),
        staked: BigInt(0),
      }
    }
  }

  getChainId() {
    return 1
  }

  signMessage(message: Uint8Array) {
    return this.kp.sign(message).signature
  }

  signAndSendTransaction(transaction: transactions.Transaction) {
    return this.assertAccount().signAndSendTransaction(transaction)
  }

  deployContract(data: Uint8Array) {
    return this.assertAccount().deployContract(data)
  }

  sendNEAR(recipient: string, amount: bigint) {
    return this.assertAccount().sendMoney(recipient, amount)
  }
}
