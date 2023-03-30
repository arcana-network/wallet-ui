import type { RpcConfig } from '@arcana/auth'
import { sign as ed25519Sign } from '@noble/ed25519'
import { transfer as transferSPL } from '@solana/spl-token'
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  VersionedTransaction,
} from '@solana/web3.js'
import bs58 from 'bs58'
import { ethers } from 'ethers'

import { NFTContractType } from '@/models/NFT'

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
      // ???
      throw new Error('Address not found.')
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

  async signTransaction(fromAddr: string, data: Buffer): Promise<Buffer> {
    const k = this.getKPForAddr(fromAddr)
    // how unfortunate
    return Buffer.from(await ed25519Sign(data, k))
  }

  async sendTransaction(data: Buffer): Promise<string> {
    const deserialized = VersionedTransaction.deserialize(data)
    return this.conn.sendTransaction(deserialized)
  }

  async signAndSendTransaction(
    fromAddr: string,
    data: Buffer
  ): Promise<string> {
    const k = this.getKPForAddr(fromAddr)
    const txActual = VersionedTransaction.deserialize(data)
    const sig = await ed25519Sign(data, k)
    txActual.addSignature(this.kp.publicKey, sig)
    return await this.conn.sendTransaction(txActual)
  }

  async signMessage(fromAddr: string, message: Buffer): Promise<Buffer> {
    const k = this.getKPForAddr(fromAddr)
    if (!(k instanceof Buffer)) {
      // TODO fix
      throw new Error('???')
    }

    return Buffer.from(await ed25519Sign(message, k))
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
  sendCustomToken = async (
    contractAddress,
    recipientAddress,
    amount,
    gasFees,
    contractType: NFTContractType
  ) => {
    switch (contractType) {
      case NFTContractType.SOLANA_SPL:
        return transferSPL(
          this.conn,
          this.kp,
          contractAddress,
          recipientAddress,
          this.kp.publicKey,
          1n
        )
      case NFTContractType.ERC1155:
      case NFTContractType.ERC721:
      default:
        throw new Error('invalid contract type for Solana')
    }
  }
}
