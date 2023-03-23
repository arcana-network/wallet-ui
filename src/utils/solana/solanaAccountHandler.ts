import type { RpcConfig } from '@arcana/auth'
import { sign as ed25519Sign } from '@noble/ed25519'
import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js'
import bs58 from 'bs58'
import type { MessageParams } from 'eth-json-rpc-middleware'
import { ethers } from 'ethers'

export class SolanaAccountHandler {
  // conn and rpcConfig can be change
  private conn: Connection
  private rpcConfig!: RpcConfig

  private readonly privateKey: Buffer
  // Not a hash, nor is it 20 bytes, it's the whole public key encoded with Base58
  private readonly address: string
  private readonly kp: Keypair

  constructor(
    privateKey: Buffer,
    rpcUrl: string = process.env.VUE_APP_WALLET_SOLANA_RPC_URL
  ) {
    this.privateKey = privateKey
    this.conn = new Connection(rpcUrl, 'confirmed')
    this.kp = Keypair.fromSecretKey(<Uint8Array>privateKey)
    this.address = this.kp.publicKey.toBase58()
  }

  // unfortunately all the APIs desire a stupid base58-encoded string
  private coerceAmbiguousToString(x: string | Uint8Array) {
    let y: string
    if (x instanceof Uint8Array) {
      y = bs58.encode(x)
    } else {
      // noinspection JSSuspiciousNameCombination
      y = x
    }
    return y
  }

  private getKPForAddr(addr: string) {
    // multiple addresses are not supported
    if (addr != this.address) {
      return undefined
    }
    return this.privateKey
  }

  async getBalance(): Promise<ethers.BigNumber> {
    const lamports = await this.conn.getBalance(this.kp.publicKey)
    return ethers.BigNumber.from(lamports / LAMPORTS_PER_SOL)
  }

  async setProvider(str): Promise<void> {
    this.conn = new Connection(str, 'confirmed')
  }

  async signTransactionWrapper(params: MessageParams): Promise<Buffer> {
    const k = this.getKPForAddr(params.from)
    if (!(k instanceof Buffer)) {
      // TODO fix
      throw new Error('???')
    }

    // how unfortunate
    return Buffer.from(await ed25519Sign(params.data, k))
  }

  getAccountsWrapper(): Promise<string[]> {
    return Promise.resolve([this.address])
  }

  getEncryptionPublicKeyWrapper(from: string): Promise<string> {
    if (from != this.address) {
      /// ???
      throw new Error('???')
    }
    return Promise.resolve(this.address)
  }

  getAccount() {
    return {
      address: this.address,
      publicKey: this.address,
    }
  }

  setRpcConfig(rc: RpcConfig) {
    this.rpcConfig = rc
  }
  getChainId() {
    return this.rpcConfig.chainId
  }

  getTransaction(tHash: string | Uint8Array) {
    const h = this.coerceAmbiguousToString(tHash)
    return this.conn.getParsedTransaction(h)
  }
}
