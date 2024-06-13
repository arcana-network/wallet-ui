import type { RpcConfig } from '@arcana/auth'
import bs58 from 'bs58'
import Decimal from 'decimal.js'
import {
  JsonRpcEngine,
  JsonRpcRequest,
  PendingJsonRpcResponse,
  createAsyncMiddleware,
} from 'json-rpc-engine'
import type { Connection } from 'penpal'

import { ParentConnectionApi, ProviderEvent } from '@/models/Connection'
import { ChainType } from '@/utils/chainType'
import { SolanaAccountHandler } from '@/utils/solana/accountHandler'
import { toHex } from '@/utils/toHex'

class SolanaRequestHandler {
  private handler?: JsonRpcEngine
  private connection?: Connection<ParentConnectionApi> | null
  private connectSent = false
  constructor(private accountHandler: SolanaAccountHandler) {}

  get chainType() {
    return ChainType.solana_cv25519
  }

  onDisconnect() {
    this.connectSent = false
  }

  public async setRpcConfig(c: RpcConfig) {
    await this.accountHandler.setRpcConfig(c)
    this.handler = this.initRpcEngine()
    // Emit `chainChanged` event
    // const chainId = await this.accountHandler.getChainId()
    // this.emitEvent('chainChanged', { chainId })
  }

  public async sendConnect() {
    if (!this.connectSent) {
      this.connectSent = true
      const chainId = this.accountHandler.getChainId()
      await this.emitEvent('connect', {
        chainId: new Decimal(chainId).toHexadecimal(),
      })
    }
  }

  public sendAddressType(addressType: string): Promise<void> {
    return this.emitEvent('addressChanged', addressType)
  }

  public async emitEvent(e: string, params?: ProviderEvent) {
    const c = await this.getConnection('onEvent')
    if (!(c instanceof Error)) {
      await c.onEvent(e, params)
    }
  }

  public getAccountHandler() {
    return this.accountHandler
  }

  public setConnection(connection: Connection<ParentConnectionApi>): void {
    this.connection = connection
  }

  private async getConnection(fn: string) {
    if (this.connection) {
      const c = await this.connection.promise
      if (c[fn]) {
        return c
      }
      return new Error(`Could not find ${fn} function on connection`)
    }
    return new Error('No connection')
  }

  public async reply(
    method: string,
    response: PendingJsonRpcResponse<unknown>
  ) {
    const c = await this.getConnection('onMethodResponse')
    if (!(c instanceof Error)) {
      await c.onMethodResponse(method, response)
    }
  }

  public request(request: JsonRpcRequest<unknown>) {
    if (!request.id) {
      request.id = 1
    }

    return this.handleRequest(request)
  }

  private async handleRequest(req: JsonRpcRequest<unknown>) {
    if (!this.handler) {
      return
    }

    const response: PendingJsonRpcResponse<unknown> = await this.handler.handle(
      req
    )
    return response
  }

  // 1st is the actual data and the 2nd is the address used

  private principalHandler = async (
    req: JsonRpcRequest<unknown>,
    res: PendingJsonRpcResponse<unknown>,
    next: () => void
  ) => {
    if (req.params == null && req.method !== 'getAccounts') {
      throw new Error('params is required')
    }
    switch (req.method) {
      case 'getAccounts': {
        const result = await this.accountHandler.getAccounts()
        res.result = result
        break
      }
      case 'signTransaction': {
        const p = req.params as {
          message: string
        }
        res.result = bs58.encode(
          await this.accountHandler.signTransaction(bs58.decode(p.message))
        )
        break
      }
      case 'signAllTransactions': {
        const p = req.params as {
          message: string[]
        }
        const signatures = [] as any[]
        for (const m of p.message) {
          const encoded = bs58.encode(
            await this.accountHandler.signTransaction(bs58.decode(m))
          )
          signatures.push(encoded)
        }
        res.result = signatures
        break
      }
      case 'signAndSendTransaction': {
        const p = req.params as {
          message: string
        }
        const sig = await this.accountHandler.signAndSendTransaction(
          bs58.decode(p.message)
        )
        res.result = {
          signature: sig,
          publicKey: this.accountHandler.publicKey.toBase58(),
        }
        break
      }
      case 'signMessage': {
        const p = req.params as {
          message: string
          display: string
        }
        const data = bs58.decode(p.message)
        const sig = await this.accountHandler.signMessage(data)
        res.result = {
          signature: bs58.encode(sig),
          publicKey: this.accountHandler.publicKey.toBase58(),
        }
        break
      }
      default: {
        throw new Error('Invalid method')
      }
    }
  }

  private initRpcEngine() {
    const engine = new JsonRpcEngine()
    engine.push(createAsyncMiddleware(this.principalHandler))
    return engine
  }
}

export { SolanaRequestHandler }
