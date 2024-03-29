import { AppMode } from '@arcana/auth'

enum WalletType {
  NoUI = 0,
  UI = 1,
}

const WALLET_TYPE_APP_MODE_MAPPINGS = {
  [WalletType.UI]: [AppMode.Widget, AppMode.Full],
  [WalletType.NoUI]: [AppMode.NoUI],
}

const DEFAULT_APP_MODE = {
  [WalletType.UI]: AppMode.Widget,
  [WalletType.NoUI]: AppMode.NoUI,
}

function getValidAppMode(
  walletType: WalletType,
  appMode?: AppMode
): AppMode | undefined {
  const allowedModes = WALLET_TYPE_APP_MODE_MAPPINGS[walletType]
  if (appMode === undefined) return allowedModes[0]
  if (!allowedModes) return appMode
  return allowedModes.includes(appMode) ? appMode : DEFAULT_APP_MODE[walletType]
}

export default getValidAppMode
