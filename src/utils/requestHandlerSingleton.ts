import { EthereumRequestHandler } from '@/utils/evm/requestHandler'

let requestHandler: EthereumRequestHandler | null

function setRequestHandler(handler: EthereumRequestHandler) {
  if (!requestHandler) {
    requestHandler = handler
    return
  }
  // TODO remove
  throw new Error('RequestHandler already initialized')
}

function getRequestHandler(): EthereumRequestHandler {
  if (!requestHandler) {
    throw new Error('RequestHandler not initialized yet')
  }
  return requestHandler
}

function deleteRequestHandler() {
  if (!requestHandler) {
    throw new Error('RequestHandler not initialized yet')
  }
  requestHandler = null
}

export { getRequestHandler, deleteRequestHandler, setRequestHandler }
