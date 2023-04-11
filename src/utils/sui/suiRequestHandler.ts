import type { RpcConfig } from '@arcana/auth'
import { ChainType } from '@arcana/auth'
import bs58 from 'bs58'
import {
  JsonRpcEngine,
  JsonRpcRequest,
  PendingJsonRpcResponse,
  createAsyncMiddleware,
} from 'json-rpc-engine'
import type { Connection } from 'penpal'

import { ParentConnectionApi, ProviderEvent } from '@/models/Connection'
import { SuiAccountHandler } from '@/utils/sui/suiAccountHandler'

class SuiRequestHandler {
  private handler?: JsonRpcEngine
  private connection?: Connection<ParentConnectionApi> | null
  constructor(private accountHandler: SuiAccountHandler) {}

  get chainType() {
    return ChainType.solana_cv25519
  }

  public async setRpcConfig(c: RpcConfig) {
    await this.accountHandler.setRpcConfig(c)
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
    req: JsonRpcRequest<[string, string]>,
    res: PendingJsonRpcResponse<string | string[]>,
    next: () => void
  ) => {
    if (req.params == null) {
      throw new Error('???')
    }
    switch (req.method) {
      case 'getAccounts': {
        res.result = await this.accountHandler.getAccounts()
        break
      }
      case 'signAndSendTransaction': {
        const data = Buffer.from(bs58.decode(req.params[0]))
        res.result = await this.accountHandler.signAndSendTransaction(
          req.params[1],
          data
        )
        break
      }
      case 'signTransaction': {
        const data = Buffer.from(bs58.decode(req.params[0]))
        res.result = bs58.encode(
          await this.accountHandler.signTransaction(req.params[1], data)
        )
        break
      }
      case 'signMessage': {
        const data = Buffer.from(bs58.decode(req.params[0]))
        res.result = bs58.encode(
          await this.accountHandler.signMessage(req.params[1], data)
        )
        break
      }
      default: {
        throw new Error('Invalid method')
      }
    }
    next()
  }

  private initRpcEngine() {
    const engine = new JsonRpcEngine()
    engine.push(createAsyncMiddleware(this.principalHandler))
    return engine
  }
}

export { SuiRequestHandler }
