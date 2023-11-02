import type { RpcConfig } from '@arcana/auth'
import bs58 from 'bs58'
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

class SolanaRequestHandler {
  private handler?: JsonRpcEngine
  private connection?: Connection<ParentConnectionApi> | null
  constructor(private accountHandler: SolanaAccountHandler) {}

  get chainType() {
    return ChainType.solana_cv25519
  }

  public async setRpcConfig(c: RpcConfig) {
    this.accountHandler.setRpcConfig(c)
    this.handler = this.initRpcEngine()
    // Emit `chainChanged` event
    // const chainId = await this.accountHandler.getChainId()
    // this.emitEvent('chainChanged', { chainId })
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
    console.log({ request })
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
    if (req.params == null) {
      throw new Error('???')
    }
    switch (req.method) {
      case 'getAccounts': {
        const result = await this.accountHandler.getAccounts()
        res.result = result
        break
      }
      /* case 'signAndSendTransaction': {
        const data = Buffer.from(bs58.decode(req.params[0]))
        res.result = await this.accountHandler.signAndSendTransaction(
          req.params[1],
          data
        )
        break
      }
      case 'signTransaction': {
        const data = Buffer.from(bs58.decode(req.params.message))
        const fromAddr = await this.accountHandler.getAccounts()
        res.result = bs58.encode(
          await this.accountHandler.signTransaction(fromAddr[0], data)
        )
        break
      }*/
      case 'signTransaction': {
        const p = req.params as {
          message: string
        }
        res.result = bs58.encode(
          await this.accountHandler.signTransaction(bs58.decode(p.message))
        )
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
        console.log('Default request')
        throw new Error('Invalid method')
      }
    }
    console.log({ res })
  }

  private initRpcEngine() {
    const engine = new JsonRpcEngine()
    engine.push(createAsyncMiddleware(this.principalHandler))
    return engine
  }
}

export { SolanaRequestHandler }
