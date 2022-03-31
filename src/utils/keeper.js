export class Keeper {
  constructor(privateKey, permissions, walletType, accountHandler) {
    this.permissions = permissions;
    this.walletType = walletType;
    this.accountHandler = accountHandler;
    this.connection = null;
  }

  isPermissionRequired(method) {
    return this.walletType <= 1 && this.permissions[method];
  }

  setConnection(connection) {
    this.connection = connection;
  }

  async reply(method, response) {
    this.connection.onMethodResponse(method, response);
  }

  async handleRequest(request) {
    const response = {
      id: request.id,
    };
    switch (request.method) {
      case "eth_accounts":
        response.result = this.accountHandler.getAccounts();
        return response;
      case "eth_getEncryptionPublicKey":
        response.result = this.accountHandler.getPublicKey(request.params[0]);
        return response;
      case "eth_sign":
        response.result = await this.accountHandler.requestSign(
          request.params[0],
          request.params[1]
        );
        return response;
      default:
        return;
    }
  }
}
