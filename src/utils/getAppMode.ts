import { AppMode } from '@arcana/wallet'

enum WalletType {
  NoUI = 0,
  UI = 1,
}

const ModeWalletTypeRelation = {
  [WalletType.UI]: [AppMode.Widget, AppMode.Full],
  [WalletType.NoUI]: [AppMode.NoUI],
}

function getAppMode(
  walletType: WalletType,
  appMode: AppMode | undefined
): AppMode {
  const allowedModes = ModeWalletTypeRelation[walletType]
  if (appMode !== undefined) {
    if (!allowedModes.includes(appMode)) {
      return allowedModes[0]
    }
    return appMode
  } else {
    return allowedModes[0]
  }
}

export default getAppMode
