import { EthereumAccountHandler } from '@/utils/evm/ethereumAccountHandler'
import { RequestHandler } from '@/utils/evm/requestHandler'

let requestHandler: RequestHandler | null

const setRequestHandler = (accountHandler: EthereumAccountHandler) => {
  if (!requestHandler) {
    requestHandler = new RequestHandler(accountHandler)
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
  if (!requestHandler) {
    throw new Error('RequestHandler not initialized yet.')
  }
  requestHandler = null
}

export { setRequestHandler, getRequestHandler, deleteRequestHandler }
