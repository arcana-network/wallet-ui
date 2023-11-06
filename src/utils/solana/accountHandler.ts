import type { RpcConfig } from '@arcana/auth'
import { signAsync as ed25519Sign } from '@noble/ed25519'
import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js'
import bs58 from 'bs58'
import { ethers } from 'ethers'

import { ChainType } from '@/utils/chainType'

export class SolanaAccountHandler {
  // conn and rpcConfig can be change
  private conn: Connection
  private rpcConfig!: RpcConfig

  // Not a hash, nor is it 20 bytes, it's the whole public key encoded with Base58
  private readonly address: string
  private readonly kp: Keypair

  constructor(privateKey: Uint8Array, rpcUrl: string) {
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

  private getKPForAddr() {
    return this.kp.secretKey.slice(0, 32)
  }

  get publicKey() {
    return this.kp.publicKey
  }

  async getBalance(): Promise<ethers.BigNumber> {
    const lamports = await this.conn.getBalance(this.kp.publicKey)
    return ethers.BigNumber.from(lamports)
  }

  async setProvider(str): Promise<void> {
    this.conn = new Connection(str, 'confirmed')
  }

  async sendTransaction(data: Uint8Array): Promise<string> {
    const deserialized = VersionedTransaction.deserialize(data)
    return this.conn.sendTransaction(deserialized)
  }

  async signTransaction(data: Uint8Array): Promise<Uint8Array> {
    const deserialized = VersionedTransaction.deserialize(data)
    deserialized.sign([this.kp])
    return deserialized.serialize()
  }

  async signAndSendTransaction(data: Uint8Array): Promise<string> {
    const txActual = VersionedTransaction.deserialize(data)
    txActual.sign([this.kp])
    return await this.conn.sendTransaction(txActual)
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    const k = this.getKPForAddr()
    return ed25519Sign(message, k)
  }

  getAccounts(): Promise<string[]> {
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

  // NFT-related functions below
  sendCustomToken = async (...params) => {
    return null
  }

  get chainType() {
    return ChainType.solana_cv25519
  }
}
