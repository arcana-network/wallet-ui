import { EthereumAccountHandler } from '@/utils/evm/ethereumAccountHandler'
import { EthereumRequestHandler } from '@/utils/evm/requestHandler'

let requestHandler: EthereumRequestHandler | null

const setEthereumRequestHandler = (accountHandler: EthereumAccountHandler) => {
  if (!requestHandler) {
    requestHandler = new EthereumRequestHandler(accountHandler)
    return
  }
  throw new Error('EthereumRequestHandler already initialized.')
}

const getEthereumRequestHandler = () => {
  if (!requestHandler) {
    throw new Error('EthereumRequestHandler not initialized yet.')
  }
  return requestHandler
}

const deleteEthereumRequestHandler = () => {
  if (!requestHandler) {
    throw new Error('EthereumRequestHandler not initialized yet.')
  }
  requestHandler = null
}

export {
  setEthereumRequestHandler,
  getEthereumRequestHandler,
  deleteEthereumRequestHandler,
}
