import { PollingBlockTracker, Provider } from 'eth-block-tracker'
import {
  createFetchMiddleware,
  providerFromMiddleware,
  createBlockRefMiddleware,
  createRetryOnEmptyMiddleware,
  createInflightCacheMiddleware,
  createBlockCacheMiddleware,
  createBlockTrackerInspectorMiddleware,
} from 'eth-json-rpc-middleware'
import {
  JsonRpcEngine,
  JsonRpcRequest,
  PendingJsonRpcResponse,
  createScaffoldMiddleware,
  JsonRpcMiddleware,
} from 'json-rpc-engine'
import type { Connection } from 'penpal'

import { ParentConnectionApi, ProviderEvent } from '@/models/Connection'
import { AccountHandler } from '@/utils/accountHandler'

interface RpcConfig {
  rpcUrls: string[]
  chainId: number
  chainName?: string
  blockExplorerUrls?: string[]
  nativeCurrency?: {
    symbol: string
    decimals: number
  }
}

class RequestHandler {
  private handler?: JsonRpcEngine
  private connection?: Connection<ParentConnectionApi> | null
  constructor(private accountHandler: AccountHandler) {}

  public async setRpcConfig(c: RpcConfig) {
    this.handler = this.initRpcEngine(c)
    this.accountHandler.setProvider(c.rpcUrls[0])
    // Emit `chainChanged` event
    const chainId = await this.accountHandler.getChainId()
    this.emitEvent('chainChanged', { chainId })
  }

  public async emitEvent(e: string, params?: ProviderEvent) {
    const c = await this.getConnection('onEvent')
    if (!(c instanceof Error)) {
      c.onEvent(e, params)
    }
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
      c.onMethodResponse(method, response)
    }
  }

  public request(request: JsonRpcRequest<unknown>) {
    if (!request.id) {
      request.id = 1
    }

    this.handleRequest(request)
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

  private initRpcEngine(c: RpcConfig): JsonRpcEngine {
    const engine = new JsonRpcEngine()
    const networkMiddleware = this.getNetAndChainMiddleware(c.chainId)
    engine.push(networkMiddleware)

    const walletMiddleware = this.accountHandler.asMiddleware()
    engine.push(walletMiddleware)

    const fetchMiddleware = createFetchMiddleware({
      rpcUrl: c.rpcUrls[0],
    })
    engine.push(fetchMiddleware)

    const blockProvider = providerFromMiddleware(fetchMiddleware)
    const blockTracker = new PollingBlockTracker({
      provider: blockProvider as Provider,
      pollingInterval: 1000,
    })

    const blockRefMiddleware = createBlockRefMiddleware({
      blockTracker,
      provider: blockProvider,
    })
    engine.push(blockRefMiddleware)

    const blockRetryOnEmptyMiddleware = createRetryOnEmptyMiddleware({
      blockTracker,
      provider: blockProvider,
    })
    engine.push(blockRetryOnEmptyMiddleware)

    const cacheMiddleware = createInflightCacheMiddleware()
    engine.push(cacheMiddleware)

    const blockCacheMiddleware = createBlockCacheMiddleware({ blockTracker })
    engine.push(blockCacheMiddleware)

    const blockTrackMiddleware = createBlockTrackerInspectorMiddleware({
      blockTracker,
    })
    engine.push(blockTrackMiddleware)
    return engine
  }

  private getNetAndChainMiddleware(chainId: number) {
    const hexChainId = getHexFromNumber(chainId)
    return createScaffoldMiddleware({
      eth_chainId: hexChainId,
      net_version: chainId,
    }) as JsonRpcMiddleware<string, unknown>
  }
}

const getHexFromNumber = (n: number, prefix = true): string => {
  const h = n.toString(16)
  return prefix ? addHexPrefix(h) : removeHexPrefix(h)
}

const HEX_PREFIX = '0x'

const addHexPrefix = (i: string) =>
  i.startsWith(HEX_PREFIX) ? i : `${HEX_PREFIX}${i}`

const removeHexPrefix = (i: string) =>
  i.startsWith(HEX_PREFIX) ? i.substring(2) : i

export { RequestHandler }
