import type { Connection } from 'penpal'

import type {
  ParentConnectionApi,
  RequestMethod,
  Request,
  Response,
} from '@/models/Connection'
import { AccountHandler } from '@/utils/accountHandler'

const NOT_SUPPORTED_TEXT = 'operation_not_supported'

export class Keeper {
  accountHandler: AccountHandler
  walletType: number
  connection: Connection<ParentConnectionApi> | null

  constructor(walletType, accountHandler) {
    this.walletType = walletType
    this.accountHandler = accountHandler
    this.connection = null
  }

  setConnection(connection: Connection<ParentConnectionApi>): void {
    this.connection = connection
  }

  async reply(method: RequestMethod, response: Response): Promise<void> {
    const connectionInstance = await this.connection?.promise
    connectionInstance?.onMethodResponse(method, response)
  }

  async handleRequest(request: Request) {
    const response = {
      id: request.id,
      result: null,
    } as Response

    switch (request.method) {
      case 'eth_accounts':
        response.result = this.accountHandler.getAccounts()
        return response
      case 'eth_getEncryptionPublicKey':
        response.result = this.accountHandler.getPublicKey(request.params[0])
        return response
      case 'eth_sign':
        response.result = await this.accountHandler.requestSign(
          request.params[0],
          request.params[1]
        )
        return response
      case 'personal_sign':
        response.result = await this.accountHandler.requestPersonalSign(
          request.params[1],
          request.params[0]
        )
        return response
      case 'eth_sendTransaction':
        response.error = NOT_SUPPORTED_TEXT
        return response
      case 'eth_decrypt':
        response.result = await this.accountHandler.requestDecryption(
          request.params[0],
          request.params[1]
        )
        return response
      case 'eth_signTransaction':
        response.error = NOT_SUPPORTED_TEXT
        return response
      case 'eth_signTypedData_v4':
        response.result = await this.accountHandler.requestSignTypedMessage(
          request.params[1],
          request.params[0]
        )
        return response
      default:
        return
    }
  }
}
