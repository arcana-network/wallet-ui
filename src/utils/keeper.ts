export class Keeper {
  constructor(privateKey, permissions, walletType, accountHandler) {
    this.permissions = permissions
    this.walletType = walletType
    this.accountHandler = accountHandler
    this.connection = null
  }

  isPermissionRequired(method) {
    return this.walletType <= 1 && this.permissions[method]
  }

  setConnection(connection) {
    this.connection = connection
  }

  async reply(method, response) {
    this.connection.onMethodResponse(method, response)
  }

  async handleRequest(request) {
    const response = {
      id: request.id,
    }
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
      case 'send_transaction':
        response.result = await this.accountHandler.requestSendTransaction(
          request.params
        )
        return response
      case 'eth_decrypt':
        response.result = await this.accountHandler.requestDecryption(
          request.params[0],
          request.params[1]
        )
        return response
      case 'eth_signTransaction':
        response.result = await this.accountHandler.requestSignTransaction(
          request.params[0],
          request.params[0].from
        )
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
