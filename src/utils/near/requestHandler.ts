import type { RpcConfig } from '@arcana/auth'
import bs58 from 'bs58'
import {
  createAsyncMiddleware,
  JsonRpcEngine,
  JsonRpcRequest,
  PendingJsonRpcResponse,
} from 'json-rpc-engine'
import { transactions } from 'near-api-js'
import type { Connection } from 'penpal'

import { ParentConnectionApi, ProviderEvent } from '@/models/Connection'
import { ChainType } from '@/utils/chainType'
import { NEARAccountHandler } from '@/utils/near/accountHandler'

class NEARRequestHandler {
  private handler?: JsonRpcEngine
  private connection?: Connection<ParentConnectionApi> | null
  private connectSent = false
  constructor(private accountHandler: NEARAccountHandler) {}

  get chainType() {
    return ChainType.near_cv25519
  }

  public async setRpcConfig(c: RpcConfig) {
    await this.accountHandler.initializeConnection(c.rpcUrls[0])
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
    req: JsonRpcRequest<unknown>,
    res: PendingJsonRpcResponse<unknown>,
    next: () => void
  ) => {
    console.log(req, 'req')
    // if (req.params == null) {
    //   throw new Error('???')
    // }
    switch (req.method) {
      case 'getAccounts': {
        res.result = this.accountHandler.getAccounts()
        break
      }
      case 'near_signAndSendTransaction': {
        const p = req.params as {
          transaction: transactions.Transaction
        }
        res.result = await this.accountHandler.signAndSendTransaction(
          p.transaction
        )
        break
      }
      case 'near_signMessage': {
        const p = req.params as {
          message: string // bs58 encoded
        }
        const sig = this.accountHandler.signMessage(bs58.decode(p.message))
        res.result = {
          signature: bs58.encode(sig),
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

export { NEARRequestHandler }
