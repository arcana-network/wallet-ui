import type { IRequestHandler } from '@/utils/requestHandlerInterfaces'

let requestHandler: IRequestHandler | null

function setRequestHandler(handler: IRequestHandler) {
  if (!requestHandler) {
    requestHandler = handler
    return
  }
  // TODO remove
  throw new Error('RequestHandler already initialized')
}

function getRequestHandler(): IRequestHandler {
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
