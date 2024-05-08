import {
  type Account,
  connect,
  keyStores,
  type Near,
  utils,
  transactions,
} from 'near-api-js'

export class NEARAccountHandler {
  private keystore = new keyStores.InMemoryKeyStore()
  private readonly kp: utils.KeyPairEd25519
  private privateKey: string // should be binary
  private readonly implicitAccountID: string
  private connection: Near | null = null
  private account: Account | null = null

  constructor(privateKey: string) {
    this.privateKey = privateKey
    this.kp = new utils.KeyPairEd25519(privateKey)
    this.implicitAccountID = Buffer.from(this.kp.publicKey.data).toString('hex')

    // how do we handle this?
    this.keystore.setKey('default', this.implicitAccountID, this.kp)
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

  async getBalance() {
    const bObj = await this.assertAccount().getAccountBalance()
    return BigInt(bObj.available) // ???
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
