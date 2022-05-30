import { AppMode } from '@arcana/wallet'

enum WalletType {
  NoUI = 0,
  UI = 1,
}

const ModeWalletTypeRelation = {
  [WalletType.UI]: [AppMode.Widget, AppMode.Full],
  [WalletType.NoUI]: [AppMode.NoUI],
}

const DEFAULT_APP_MODE = {
  [WalletType.UI]: AppMode.Widget,
  [WalletType.NoUI]: AppMode.NoUI,
}

function getValidAppMode(walletType: WalletType, appMode?: AppMode): AppMode {
  const allowedModes = ModeWalletTypeRelation[walletType]
  if (appMode === undefined) return allowedModes[0]
  return allowedModes.includes(appMode) ? appMode : DEFAULT_APP_MODE[walletType]
}

export default getValidAppMode
