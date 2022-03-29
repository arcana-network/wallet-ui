export class Keeper {
  constructor(privateKey, permissions, walletType) {
    this.permissions = permissions;
    this.walletType = walletType;
  }

  isPermissionRequired(method) {
    return this.walletType <= 1 && this.permissions[method];
  }
}
