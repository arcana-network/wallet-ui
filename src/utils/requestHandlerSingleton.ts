import { AccountHandler } from '@/utils/accountHandler'
import { RequestHandler, createRequestHandler } from '@/utils/requestHandler'

let requestHandler: RequestHandler | null = null

const requestHandlerExists = () => {
  return requestHandler != null
}

const setRequestHandler = (accountHandler: AccountHandler) => {
  if (!requestHandler) {
    requestHandler = createRequestHandler(accountHandler)
    return
  }
  throw new Error('RequestHandler already initialized.')
}

const getRequestHandler = () => {
  if (!requestHandler) {
    throw new Error('RequestHandler not initialized yet.')
  }
  return requestHandler
}

const deleteRequestHandler = () => {
  if (requestHandler) {
    requestHandler = null
  }
}

export {
  requestHandlerExists,
  setRequestHandler,
  getRequestHandler,
  deleteRequestHandler,
}
