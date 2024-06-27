import {
  JsonRpcProvider,
  StaticJsonRpcProvider,
  WebSocketProvider,
} from '@ethersproject/providers'

// Since there is no destroy method in StaticJsonRpcProvider, we had to implement this
class StaticJsonRpcProviderPlusDestroy extends StaticJsonRpcProvider {
  async destroy() {
    return
  }
}

interface JsonRpcProviderPlusDestroy extends JsonRpcProvider {
  destroy(): Promise<void>
}

function produceProviderFromURLString(rpcURL: string) {
  const u = new URL(rpcURL)
  switch (u.protocol) {
    case 'http':
    case 'https':
    case 'http:':
    case 'https:': {
      return new StaticJsonRpcProviderPlusDestroy(rpcURL)
    }
    case 'ws':
    case 'ws:':
    case 'wss':
    case 'wss:': {
      return new WebSocketProvider(rpcURL)
    }
    default: {
      throw new Error('unsupported protocol scheme')
    }
  }
}

export { JsonRpcProviderPlusDestroy, produceProviderFromURLString }
