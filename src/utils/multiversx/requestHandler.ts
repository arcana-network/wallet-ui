import type { RpcConfig } from '@arcana/auth'
import {
  SignableMessage,
  Transaction,
  IPlainTransactionObject,
  Address,
  TokenTransfer,
} from '@multiversx/sdk-core'
import Decimal from 'decimal.js'
import {
  createAsyncMiddleware,
  JsonRpcEngine,
  JsonRpcRequest,
  PendingJsonRpcResponse,
} from 'json-rpc-engine'
import type { Connection } from 'penpal'

import { ParentConnectionApi, ProviderEvent } from '@/models/Connection'
import { ChainType } from '@/utils/chainType'
import { devLogger } from '@/utils/devLogger'
import { MultiversXAccountHandler } from '@/utils/multiversx/accountHandler'
import { toHex } from '@/utils/toHex'

class MultiversXRequestHandler {
  private handler?: JsonRpcEngine
  private connection?: Connection<ParentConnectionApi> | null
  private connectSent = false
  constructor(private accountHandler: MultiversXAccountHandler) {}

  get chainType() {
    return ChainType.multiversx_cv25519
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

  private getSerializedSignatureOfTransaction(tx: Transaction) {
    return {
      signature: tx.getSignature().toString('hex'),
      guardian: undefined,
      guardianSignature: undefined,
      options: tx.getOptions().valueOf(),
      version: tx.getVersion().valueOf(),
    }
  }

  // 1st is the actual data and the 2nd is the address used

  private principalHandler = async (
    req: JsonRpcRequest<unknown>,
    res: PendingJsonRpcResponse<unknown>,
    next: () => void
  ) => {
    devLogger.log(req, 'req')
    // if (req.params == null) {
    //   throw new Error('???')
    // }
    switch (req.method) {
      case 'getAccounts': {
        res.result = this.accountHandler.getAccounts()
        break
      }
      case 'getPublicKey': {
        res.result = this.accountHandler.getPublicKey(
          req.params as Array<unknown>
        )
        break
      }
      case 'mvx_signTransaction': {
        const p = req.params as {
          transaction: IPlainTransactionObject
        }
        const sigs = this.accountHandler.signTransactions([
          Transaction.fromPlainObject(p.transaction),
        ])
        res.result = this.getSerializedSignatureOfTransaction(sigs[0])
        break
      }
      case 'mvx_signTransactions': {
        const p = req.params as {
          transactions: IPlainTransactionObject[]
        }
        res.result = {
          signatures: this.accountHandler
            .signTransactions(
              p.transactions.map((tx) => Transaction.fromPlainObject(tx))
            )
            .map((tx) => this.getSerializedSignatureOfTransaction(tx)),
        }
        break
      }
      case 'mvx_signMessage': {
        const p = req.params as {
          message: string
          address: string
        }
        const sig = this.accountHandler.signMessage(
          new SignableMessage({
            message: Buffer.from(p.message, 'utf-8'),
            address: new Address(this.accountHandler.addrStr),
          })
        )
        res.result = {
          signature: sig.hex(),
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

export { MultiversXRequestHandler }
