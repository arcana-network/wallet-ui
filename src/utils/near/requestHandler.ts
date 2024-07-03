import type { RpcConfig } from '@arcana/auth'
import { createAsyncMiddleware, JsonRpcEngine } from '@metamask/json-rpc-engine'
import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils'
import bs58 from 'bs58'
import { Decimal } from 'decimal.js'
import { transactions } from 'near-api-js'
import type { Connection } from 'penpal'

import { ParentConnectionApi, ProviderEvent } from '@/models/Connection'
import { useActivitiesStore } from '@/store/activities'
import { ChainType } from '@/utils/chainType'
import { devLogger } from '@/utils/devLogger'
import { NEARAccountHandler } from '@/utils/near/accountHandler'

class NEARRequestHandler {
  private handler?: JsonRpcEngine
  private connection?: Connection<ParentConnectionApi> | null
  private connectSent = false
  private rpcConfig: RpcConfig | null = null
  constructor(private accountHandler: NEARAccountHandler) {}

  get chainType() {
    return ChainType.near_cv25519
  }

  public async setRpcConfig(c: RpcConfig) {
    this.rpcConfig = c
    await this.accountHandler.initializeConnection(c.rpcUrls[0])
    this.handler = this.initRpcEngine()
    // Emit `chainChanged` event
    // const chainId = await this.accountHandler.getChainId()
    // this.emitEvent('chainChanged', { chainId })
  }

  onDisconnect() {
    this.connectSent = false
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
    devLogger.log(req, 'req')
    // if (req.params == null) {
    //   throw new Error('???')
    // }
    switch (req.method) {
      case 'getAccounts': {
        res.result = await this.accountHandler.getAccounts()
        break
      }
      case 'near_signAndSendTransaction': {
        const p = req.params as {
          transaction: transactions.Transaction
        }
        const result = await this.accountHandler.signAndSendTransaction(
          p.transaction
        )
        res.result = result
        const activitiesStore = useActivitiesStore()
        const hash = result.transaction.hash
        activitiesStore.saveActivity(this.rpcConfig?.chainId, {
          txHash: hash,
          explorerUrl: this.rpcConfig?.blockExplorerUrls?.[0]
            ? `${this.rpcConfig?.blockExplorerUrls[0]}/txns/${hash}`
            : undefined,
          operation:
            result.transaction.actions?.length > 0
              ? 'Batched Transaction'
              : 'Transaction',
          status: 'Success',
          date: new Date(),
          address: {
            from: result.transaction.signer_id,
            to: result.transaction.receiver_id,
          },
          transaction: {
            hash,
            amount: result.transaction.actions.reduce((acc, action) => {
              if (action.Transfer) {
                return new Decimal(action.Transfer.deposit).add(acc).toString()
              }
              if (action.Stake) {
                return new Decimal(action.Stake.stake).add(acc).toString()
              }
              if (action.FunctionCall) {
                return new Decimal(action.FunctionCall.deposit)
                  .add(acc)
                  .toString()
              }
              return acc
            }, '0'),
            nonce: result.transaction.nonce,
            totalActions: result.transaction.actions.length,
          },
        })
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
