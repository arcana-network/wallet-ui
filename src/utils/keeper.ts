import { ethers } from 'ethers'
import type { Connection } from 'penpal'

import type {
  ParentConnectionApi,
  RequestMethod,
  Request,
  Response,
} from '@/models/Connection'
import { EthersError } from '@/models/EthersError'
import { AccountHandler } from '@/utils/accountHandler'
import { convertGweiToEth } from '@/utils/gweiToEth'
import { isStringArray, isTransactionDataArray } from '@/utils/typeguards'

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

  async handleRequest(request: Request<unknown>) {
    const response = {
      id: request.id,
      result: null,
    } as Response

    switch (request.method) {
      case 'eth_accounts':
        response.result = this.accountHandler.getAccounts()
        return response
      case 'eth_getEncryptionPublicKey':
        if (isStringArray(request.params)) {
          response.result = this.accountHandler.getPublicKey(request.params[0])
        } else {
          response.error = 'Invalid type in request'
        }
        return response
      case 'eth_sign':
        if (isStringArray(request.params)) {
          response.result = await this.accountHandler.requestSign(
            request.params[0],
            request.params[1]
          )
        } else {
          response.error = 'Invalid type in request'
        }
        return response
      case 'personal_sign':
        if (isStringArray(request.params)) {
          response.result = await this.accountHandler.requestPersonalSign(
            request.params[1],
            request.params[0]
          )
        } else {
          response.error = 'Invalid type in request'
        }
        return response
      case 'eth_sendTransaction':
        try {
          if (isTransactionDataArray(request.params)) {
            const param = request.params[0]
            param.gasPrice = ethers.utils
              .parseEther(convertGweiToEth(param.gasPrice))
              .toHexString()
            response.result = await this.accountHandler.requestSendTransaction(
              request.params[0]
            )
          } else {
            response.error = 'Invalid type in request'
          }
        } catch (err) {
          response.error = (err as EthersError).reason
        }
        return response
      case 'eth_decrypt':
        if (isStringArray(request.params)) {
          response.result = await this.accountHandler.requestDecryption(
            request.params[0],
            request.params[1]
          )
        } else {
          response.error = 'Invalid type in request'
        }
        return response
      case 'eth_signTransaction':
        if (isTransactionDataArray(request.params)) {
          response.result = await this.accountHandler.requestSignTransaction(
            request.params[0]
          )
        } else {
          response.error = 'Invalid type in request'
        }
        return response
      case 'eth_signTypedData_v4':
        if (isStringArray(request.params)) {
          response.result = await this.accountHandler.requestSignTypedMessage(
            request.params[1],
            request.params[0]
          )
        } else {
          response.error = 'Invalid type in request'
        }
        return response
      default:
        return
    }
  }
}
