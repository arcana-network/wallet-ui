import type { RpcConfig } from '@arcana/auth'
import {
  Connection,
  Ed25519Keypair,
  JsonRpcProvider,
  RawSigner,
  TransactionBlock,
} from '@mysten/sui.js'
import { ethers } from 'ethers'

export class SuiAccountHandler {
  // These can change
  private rpcConfig!: RpcConfig
  private prov: JsonRpcProvider
  private signer: RawSigner

  private readonly privateKey: Buffer
  private readonly address: string
  private readonly kp: Ed25519Keypair

  constructor(
    privateKey: Buffer,
    rpcUrl: string = process.env.VUE_APP_WALLET_SUI_RPC_URL
  ) {
    this.privateKey = privateKey
    const conn = new Connection({
      fullnode: rpcUrl,
    })
    this.prov = new JsonRpcProvider(conn)
    this.kp = Ed25519Keypair.fromSecretKey(<Uint8Array>privateKey)
    this.signer = new RawSigner(this.kp, this.prov)
    this.address = this.kp.getPublicKey().toSuiAddress()
  }

  // unfortunately all the APIs desire a stupid base64-encoded string
  private coerceAmbiguousToString(x: string | Uint8Array) {
    let y: string
    if (x instanceof Uint8Array) {
      if (Buffer.isBuffer(x)) {
        return (x as Buffer).toString('base64')
      } else {
        return Buffer.from(x).toString('base64')
      }
    } else {
      // noinspection JSSuspiciousNameCombination
      y = x
    }
    return y
  }

  private getSignerForAddr(addr: string): RawSigner {
    // multiple addresses are not supported
    if (addr != this.address) {
      // ???
      throw new Error('Address not found.')
    }
    return this.signer
  }

  async getBalance(): Promise<ethers.BigNumber> {
    const bal = await this.prov.getBalance({
      owner: this.address,
    })
    return ethers.BigNumber.from(bal.totalBalance)
  }

  async setProvider(str): Promise<void> {
    const conn = new Connection({
      fullnode: str,
    })
    this.prov = new JsonRpcProvider(conn)
    this.signer = new RawSigner(this.kp, this.prov)
  }

  async signTransaction(fromAddr: string, data: Buffer): Promise<Buffer> {
    const signer = this.getSignerForAddr(fromAddr)
    const signed = await signer.signTransactionBlock({
      transactionBlock: data,
    })
    return Buffer.from(signed.signature, 'base64')
  }

  async sendTransaction(
    tBlock: Uint8Array,
    signatures: string[]
  ): Promise<string> {
    const out = await this.prov.executeTransactionBlock({
      requestType: 'WaitForEffectsCert',
      signature: signatures,
      transactionBlock: tBlock,
    })
    return out.digest
  }

  async signAndSendTransaction(
    fromAddr: string,
    data: Buffer
  ): Promise<string> {
    const k = this.getSignerForAddr(fromAddr)
    const txActual = TransactionBlock.from(data)
    const sig = await k.signTransactionBlock({
      transactionBlock: txActual,
    })
    const out = await this.prov.executeTransactionBlock({
      requestType: 'WaitForEffectsCert',
      signature: [sig.signature],
      transactionBlock: data,
    })
    return out.digest
  }

  async signMessage(fromAddr: string, message: Buffer): Promise<Buffer> {
    const s = this.getSignerForAddr(fromAddr)
    const msg = await s.signMessage({
      message,
    })

    return Buffer.from(msg.signature, 'base64')
  }

  getAccounts(): Promise<string[]> {
    return Promise.resolve([this.address])
  }

  getAddress(): Promise<string[]> {
    return this.getAccounts()
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
    return this.prov.getTransactionBlock({
      digest: h,
    })
  }
}
